import { CompanyData } from '../types';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

const fetchWithProxy = async (targetUrl: string, retryCount = 0): Promise<string> => {
  if (retryCount >= PROXIES.length) throw new Error('All proxies failed');

  try {
    const proxyUrl = PROXIES[retryCount](targetUrl);
    console.log(`[Scraper] Attempting proxy ${retryCount + 1}: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    const text = await response.text();
    if (!text || text.length < 100) throw new Error('Empty response');
    
    return text;
  } catch (error) {
    console.warn(`[Scraper] Proxy ${retryCount + 1} failed:`, error);
    return fetchWithProxy(targetUrl, retryCount + 1);
  }
};

const parseJsonLdOrganization = (doc: Document) => {
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '{}');
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Organization' || item['@type'] === 'LocalBusiness') {
          return item;
        }
        if (item['@graph']) {
          const graphItem = item['@graph'].find((g: any) => g['@type'] === 'Organization' || g['@type'] === 'LocalBusiness');
          if (graphItem) return graphItem;
        }
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  }
  return null;
};

const normalizeText = (value: string | undefined | null) => (value || '').replace(/\s+/g, ' ').trim();

const DEBUG_SCRAPER = true;

const sanitizeCandidate = (value: string) => {
  const cleaned = normalizeText(value);
  if (!cleaned) return '';
  if (cleaned.length > 140) return '';
  
  // Filter out common footer/noise patterns
  const noisePatterns = [
    /više informacija|preuzmi|osnovni podaci|financijski sažetak/i,
    /companywall|kontakt|uvjeti korištenja|obavijest o privatnosti/i,
    /©|®|™/,  // Copyright/trademark symbols
    /^\d+\s*\||\|\s*\d+$/,  // Pipe separators with numbers
    /^-+$|^\|+$/,  // Just dashes or pipes
    /^\s*[|•*\-]+\s*$/,  // Just separator symbols
    /sažetak poslovanja|računi|obaveze|imovina|potraživanja|prosječna bruto|izvor:|nekretnine/i, // Section headers
    /vlasnik|direktor|likvidator|predsjednica|prikaži sve/i, // Extra labels mixed with values
  ];
  
  for (const pattern of noisePatterns) {
    if (pattern.test(cleaned)) return '';
  }
  
  // Reject if it contains multiple occurrences of common labels (suggests aggregated content)
  const labelPatterns = /oib|mbs|datum|djelatnost|rating|telefon|email|web|vlasnik/i;
  if ((cleaned.match(labelPatterns) || []).length > 1) return '';
  
  return cleaned;
};

const extractLabelValue = (doc: Document, labels: string[]): string => {
  const lowerLabels = labels.map(l => l.toLowerCase());
  const elements = Array.from(doc.querySelectorAll('dt, th, td, span, div, p, li, strong, b, label'));

  for (const el of elements) {
    const text = normalizeText(el.textContent);
    const matchedLabel = lowerLabels.find(label => text.toLowerCase().includes(label));
    if (!matchedLabel) continue;

    // Try inline label:value format first
    const inlineMatch = text.split(':');
    if (inlineMatch.length > 1) {
      const candidate = sanitizeCandidate(inlineMatch.slice(1).join(':'));
      if (candidate) return candidate;
    }

    // Try next element sibling (dt/dd or th/td)
    if (el.tagName.toLowerCase() === 'dt') {
      const dd = el.nextElementSibling;
      const candidate = sanitizeCandidate(dd?.textContent || '');
      if (candidate) return candidate;
    }

    if (el.tagName.toLowerCase() === 'th') {
      const td = el.parentElement?.querySelector('td');
      const candidate = sanitizeCandidate(td?.textContent || '');
      if (candidate) return candidate;
    }

    // Try immediate next sibling, but skip if it looks like footer/noise
    let sibling = el.nextElementSibling;
    if (sibling) {
      const candidate = sanitizeCandidate(sibling.textContent || '');
      if (candidate) return candidate;
    }

    // Try parent's next sibling, but skip if it looks like footer text
    const parentSibling = el.parentElement?.nextElementSibling;
    if (parentSibling) {
      const candidate = sanitizeCandidate(parentSibling.textContent || '');
      if (candidate) return candidate;
    }
  }

  // Last resort: search in body text with regex pattern
  const bodyText = normalizeText(doc.body?.innerText || '');
  for (const label of labels) {
    // Look for label followed by value, but stop before footer keywords
    const regex = new RegExp(`${label}\\s*:?\\s*([^\\n\\r|©]+?)(?:\\||©|Kontakt|$)`, 'i');
    const match = bodyText.match(regex);
    if (match && match[1]) {
      const candidate = sanitizeCandidate(match[1]);
      if (candidate) return candidate;
    }
  }

  return '';
};

const parseNumber = (value: string): number => {
  if (!value) return 0;
  // Remove spaces
  let cleaned = value.replace(/\s+/g, '');
  // Handle Croatian number format: 1.234.567,89 => 1234567.89
  // If it has both dots and comma, assume comma is decimal separator
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // If only comma, it's decimal separator
    cleaned = cleaned.replace(',', '.');
  }
  // Remove any remaining non-numeric characters except minus and period
  cleaned = cleaned.replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractByRegex = (text: string, regexes: RegExp[]): string => {
  for (const regex of regexes) {
    const match = text.match(regex);
    if (match && match[1]) return sanitizeCandidate(match[1]);
  }
  return '';
};

const extractLatestFinance = (text: string) => {
  const yearsMatch = text.match(/\b(20\d{2})\b/g) || [];
  const years = Array.from(new Set(yearsMatch.map(y => Number(y)))).filter(y => y > 2000).sort((a, b) => b - a);
  
  const pickSeries = (label: string): number[] => {
    // Build variations of the label for matching (handle abbreviations)
    const labelVariations = [
      label,
      label.replace(/an broj/, 'an br'),  // "Prosječan broj" -> "Prosječan br"
      label.split(' ').join('\\s+'),  // Add flexible whitespace
    ];
    
    // Try multiple patterns for flexibility
    for (const labelVar of labelVariations) {
      const patterns = [
        // Pattern 1: Label followed by 3 numbers separated by spaces/tabs
        new RegExp(`${labelVar}\\s+([0-9\.,]+)\\s+([0-9\.,]+)\\s+([0-9\.,]+)`, 'i'),
        // Pattern 2: Numbers on same line with more separators
        new RegExp(`${labelVar}[^0-9]*([0-9\.,]+)[^0-9]+([0-9\.,]+)[^0-9]+([0-9\.,]+)`, 'i'),
        // Pattern 3: More flexible - handle line breaks and extra spaces
        new RegExp(`${labelVar}[\\s\\n]*([0-9\.,]+)[\\s\\n]+([0-9\.,]+)[\\s\\n]+([0-9\.,]+)`, 'i'),
      ];
      
      for (const regex of patterns) {
        const match = text.match(regex);
        if (match && match[1] && match[2] && match[3]) {
          const val1 = parseNumber(match[1]);
          const val2 = parseNumber(match[2]);
          const val3 = parseNumber(match[3]);
          // Only return if at least one value is non-zero (to avoid extracting wrong format)
          if (val1 !== 0 || val2 !== 0 || val3 !== 0) {
            return [val1, val2, val3];
          }
        }
      }
    }
    return [];
  };

  const incomes = pickSeries('Ukupni prihodi');
  const expenses = pickSeries('Ukupni rashodi');
  const profit = pickSeries('Rezultat poslovanja');
  const employees = pickSeries('Prosječan broj radnika');

  if (incomes.length === 0 && expenses.length === 0 && profit.length === 0 && employees.length === 0) return null;

  // Return all available years as array
  const financials = [];
  for (let i = 0; i < Math.min(3, years.length); i++) {
    if (incomes[i] !== undefined || expenses[i] !== undefined || profit[i] !== undefined || employees[i] !== undefined) {
      financials.push({
        year: years[i],
        income: incomes[i] || 0,
        expenses: expenses[i] || 0,
        profit: profit[i] || 0,
        employees: Math.round(employees[i] || 0)
      });
    }
  }

  return financials.length > 0 ? financials : null;
};

const extractAllPhones = (text: string): string[] => {
  // Match various Croatian phone formats
  const phoneRegex = /\b(0\d{1,2}[-/\s]?\d{3,4}[-/\s]?\d{3,4}|\+385[-/\s]?\d+[-/\s]?\d+[-/\s]?\d+)\b/g;
  const matches = text.match(phoneRegex) || [];
  
  // Normalize and deduplicate
  const normalized = matches.map(p => {
    const clean = p.trim().replace(/\s+/g, '');
    // Only keep if it looks like a valid phone (at least 9 digits)
    const digitCount = (clean.match(/\d/g) || []).length;
    return digitCount >= 9 ? clean : null;
  }).filter(p => p !== null) as string[];
  
  const unique = Array.from(new Set(normalized));
  return unique.slice(0, 5); // Max 5 phones
};

const extractDescription = (doc: Document): string => {
  // Look for company description paragraphs
  const descriptionSelectors = [
    'meta[name="description"]',
    'meta[property="og:description"]',
    '[class*="opis"]',
    '[class*="description"]'
  ];
  
  for (const selector of descriptionSelectors) {
    const el = doc.querySelector(selector);
    if (el) {
      const content = el.getAttribute('content') || el.textContent || '';
      const cleaned = sanitizeCandidate(content);
      if (cleaned && cleaned.length > 20) return cleaned;
    }
  }

  // Try finding paragraphs near company info
  const paragraphs = Array.from(doc.querySelectorAll('p')).slice(0, 3);
  for (const p of paragraphs) {
    const text = normalizeText(p.textContent);
    if (text.length > 30 && text.length < 300 && !text.includes('Preuzmite') && !text.includes('Više informacija')) {
      const candidate = sanitizeCandidate(text);
      if (candidate) return candidate;
    }
  }

  return '';
};

const extractBankAccounts = (text: string): any[] => {
  // Format: HR7124020061100088942  09.04.2002. - ERSTE & STEIERMÄRKISCHE BANK d.d. Aktivan
  const ibanRegex = /HR\d{2}\d{14}/g;
  const ibans = text.match(ibanRegex) || [];
  const accounts = [];

  for (const iban of ibans) {
    // Try to find info after IBAN
    const ibanIndex = text.indexOf(iban);
    const segment = text.substring(ibanIndex, ibanIndex + 200);
    
    const dateRegex = /(\d{2}\.\d{2}\.\d{4}\.)/;
    const bankRegex = /([A-ZČŠŽ][A-Za-z\s&\.d]+)/;
    const statusRegex = /(Aktivan|Neaktivan|Zatvoren)/i;
    
    const dateMatch = segment.match(dateRegex);
    const bankMatch = segment.match(bankRegex);
    const statusMatch = segment.match(statusRegex);
    
    accounts.push({
      iban: iban.substring(0, 21),
      opened: dateMatch?.[1] || '-',
      bank: bankMatch?.[1]?.trim() || '-',
      status: statusMatch?.[1]?.trim() || 'Unknown'
    });
  }

  return accounts;
};

const parseCompanyHtml = (html: string, term: string): CompanyData | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const isOibSearch = /^\d{11}$/.test(term.trim());

  // Helper to find text by label
  const getInfo = (label: string): string => {
     // Find elements containing label
     const elements = Array.from(doc.querySelectorAll('*'));
     for (const el of elements) {
         if (el.children.length === 0 && el.textContent?.includes(label)) {
             // Try next sibling
             let next = el.nextElementSibling;
             if (next) return next.textContent?.trim() || '';
             // Try parent's next sibling (common in definition lists)
             return el.parentElement?.nextElementSibling?.textContent?.trim() || '';
         }
     }
     return '';
  };

  const org = parseJsonLdOrganization(doc);
  const jsonName = normalizeText(org?.name);
  const jsonAddress = normalizeText(org?.address?.streetAddress || org?.address?.addressLocality || org?.address?.addressRegion || org?.address?.addressCountry);
  const jsonPhone = normalizeText(org?.telephone);
  const jsonEmail = normalizeText(org?.email);
  const jsonUrl = normalizeText(org?.url);

  const bodyText = normalizeText(doc.body?.innerText || '');
  const name = normalizeText(doc.querySelector('h1')?.textContent) || jsonName || normalizeText(doc.querySelector('meta[property="og:title"]')?.getAttribute('content')) || term;
  
  // Extract OIB - prioritize exact regex match over label extraction
  const oibRegexMatch = bodyText.match(/\bOIB\s*:?\s*(\d{11})\b/)?.[1];
  const oibLabel = extractLabelValue(doc, ['OIB']);
  // Only use label value if it's exactly 11 digits
  const oib = oibRegexMatch || (oibLabel && /^\d{11}$/.test(oibLabel) ? oibLabel : '') || '';
  
  // Basic validation - if no OIB found in page, it's likely not a valid company page
  if (!oib && !html.includes('OIB')) return null;
  if (isOibSearch && (!oib || oib !== term.trim())) return null;

  // Extract all financials (multiple years)
  const financials: any[] = [];
  const financialsArray = extractLatestFinance(bodyText);
  if (financialsArray) {
    financials.push(...financialsArray);
  }

  // Extract all phones
  const allPhones = extractAllPhones(bodyText);
  
  // Try to find the main phone number specifically
  const mainPhoneRegex = /Glavni\s+telefon\s*:?\s*([0-9\/+\-\s]+?)(?:\n|Telefon|Email|Web|$)/i;
  const mainPhoneMatch = bodyText.match(mainPhoneRegex);
  const mainPhoneCandidate = mainPhoneMatch ? mainPhoneMatch[1].trim().replace(/\s+/g, '') : null;
  
  // Use main phone if found and valid, otherwise use first from list
  let primaryPhone = jsonPhone || '-';
  if (mainPhoneCandidate && (mainPhoneCandidate.match(/\d/g) || []).length >= 9) {
    primaryPhone = mainPhoneCandidate;
  } else if (allPhones.length > 0) {
    primaryPhone = allPhones[0];
  }

  // Extract description
  const description = extractDescription(doc);

  // Extract bank accounts
  const bankAccounts = extractBankAccounts(bodyText);

  // Extract tax debt and blockade info
  // More specific blockade detection - should match explicit blockade status, not just any mention
  const inBlockade = /Nije u blokadi|blokada:\s*DA|status.*blokad|u blokadi:\s*DA/i.test(bodyText) && 
                     !/Nije u blokadi|nije u blokadi/i.test(bodyText);
  const taxDebtMatch = bodyText.match(/Porezni dug\s*:?\s*([^\.]+)/i);
  const taxDebt = taxDebtMatch ? sanitizeCandidate(taxDebtMatch[1]) : '';

  // Extract real estate info
  const realEstateMatch = bodyText.match(/Nekretnine[^\n]+\n([^\n]+)/i);
  const realEstate = realEstateMatch ? sanitizeCandidate(realEstateMatch[1]) : '';

  return {
    name,
    fullName: name,
    oib: oib || '',
    mbs: (() => {
      const mbsRegexMatch = bodyText.match(/\bMBS\s*:?\s*(\d+)(?:\D|$)/)?.[1];
      const mbsLabel = extractLabelValue(doc, ['MBS']);
      // Validate: MBS should be numeric and NOT equal to OIB
      const isNumeric = /^\d+([.\s-]*\d+)*$/.test(mbsLabel);
      const mbsCandidate = mbsRegexMatch || (mbsLabel && isNumeric ? mbsLabel.replace(/[.\s-]/g, '') : '');
      // Ensure MBS is not the same as OIB
      return (mbsCandidate && mbsCandidate !== oib) ? mbsCandidate : '';
    })(),
    address: extractByRegex(bodyText, [
      /Adresa tvrtke je\s+([^\.]+)\./i,
      /Adresa\s+([^\n]+?\d{5}[^\n]+)/i
    ]) || extractLabelValue(doc, ['Adresa', 'Sjedište']) || jsonAddress || normalizeText(doc.querySelector('[itemprop="address"]')?.textContent) || '-',
    founded: extractByRegex(bodyText, [/Datum osnivanja\s+(\d{2}\.\d{2}\.\d{4}\.)/i]) || extractLabelValue(doc, ['Osnovano', 'Datum osnivanja']) || '-',
    status: bodyText.includes('Aktivan') ? 'Aktivan' : bodyText.includes('Neaktivan') ? 'Neaktivan' : '-',
    activity: extractByRegex(bodyText, [/NKD\s+([^\n]+?)\s+MB/i, /NKD\s+([^\n]+?)\s+Više/i]) || extractLabelValue(doc, ['Djelatnost', 'NKD']) || '-',
    size: extractLabelValue(doc, ['Veličina']) || '-',
    rating: extractLabelValue(doc, ['Rating', 'Ocjena']) || '-',
    blocked: inBlockade,
    phone: primaryPhone,
    email: (() => {
      // Try JSON-LD email first if valid
      if (jsonEmail && jsonEmail.includes('@') && !jsonEmail.includes('http')) return jsonEmail;
      // Try extracting from document
      const extracted = extractLabelValue(doc, ['E-mail', 'Email']);
      // Only use if it's a valid email format (contains @ and not a URL)
      if (extracted && extracted.includes('@') && !extracted.includes('http') && !extracted.includes('/')) return extracted;
      return '-';
    })(),
    website: (() => {
      // Try JSON-LD URL first if it's an actual website
      if (jsonUrl && jsonUrl.includes('http')) return jsonUrl;
      // Try body text regex for URLs
      const urlMatch = bodyText.match(/https?:\/\/[^\s|•*\-©]+/)?.[0];
      if (urlMatch && !urlMatch.includes('companywall')) return urlMatch;
      // Try label extraction
      const extracted = extractLabelValue(doc, ['Web', 'Website', 'Web stranica']);
      if (extracted && extracted.includes('http')) return extracted;
      return '-';
    })(),
    owner: extractByRegex(bodyText, [/Vlasnik\s+([^,]+?)(?:,|Prikaži|Osnovni)/i]) || extractLabelValue(doc, ['Vlasnik', 'Vlasništvo']) || '-',
    directors: [
      extractByRegex(bodyText, [/Likvidator\s+([^,]+?)(?:,|Prikaži|Osnovni)/i]),
      extractByRegex(bodyText, [/Predsjednica\s+([^,]+?)(?:,|Prikaži|Osnovni)/i]),
      extractByRegex(bodyText, [/Direktor\s+([^,]+?)(?:,|Prikaži|Osnovni)/i])
    ].filter(Boolean),
    financials: financials,
    description: description,
    phones: allPhones,
    bankAccounts: bankAccounts,
    realEstate: realEstate,
    taxDebt: taxDebt,
    inBlockade: inBlockade
  };
};

const CompanyService = {
  search: async (term: string): Promise<CompanyData | null> => {
    try {
      console.log(`Starting Proxy Search for: ${term}`);

      // 1. First Phase: Search Results
      const searchUrl = `https://www.companywall.hr/pretraga?q=${encodeURIComponent(term)}`;
      const searchHtml = await fetchWithProxy(searchUrl);
      
      const parser = new DOMParser();
      const searchDoc = parser.parseFromString(searchHtml, 'text/html');
      
      const termLower = term.trim().toLowerCase();
      const anchors = Array.from(searchDoc.querySelectorAll('a[href^="/tvrtka/"]'));
      const candidates = anchors.map(a => {
        const href = a.getAttribute('href') || '';
        const container = a.closest('.result-item') || a.closest('li') || a.parentElement;
        const blob = (container?.textContent || a.textContent || '').toLowerCase();
        return { href, blob };
      }).filter(c => c.href);
      let companyLink = candidates.find(c => c.blob.includes(termLower))?.href;
      if (!companyLink) {
        companyLink = searchDoc.querySelector('.result-item a')?.getAttribute('href') ||
          searchDoc.querySelector('a[href^="/tvrtka/"]')?.getAttribute('href');
      }
                        
      if (!companyLink) {
          console.warn('No company link found in search results');
          // Fallback: If searched by OIB, maybe construct direct URL? 
          // But companywall uses names in URL. 
          return null;
      }

      // 2. Second Phase: Fetch Details
      const detailsUrl = `https://www.companywall.hr${companyLink}`;
      console.log(`Fetching details from: ${detailsUrl}`);
      const detailsHtml = await fetchWithProxy(detailsUrl);
      
      const companyData = parseCompanyHtml(detailsHtml, term);
      
      if (companyData) {
         if (DEBUG_SCRAPER) {
           console.log('[Scraper] Parsed fields:', {
             name: companyData.name,
             oib: companyData.oib,
             mbs: companyData.mbs,
             address: companyData.address,
             founded: companyData.founded,
             status: companyData.status,
             activity: companyData.activity,
             size: companyData.size,
             rating: companyData.rating,
             phone: companyData.phone,
             email: companyData.email,
             website: companyData.website,
             owner: companyData.owner,
             directors: companyData.directors,
             financials: companyData.financials,
             phones: companyData.phones
           });
         }
         // Cache to DB
         try {
            const companiesRef = collection(db, "companies");
            const q = query(companiesRef, where("oib", "==", companyData.oib));
            const snapshot = await getDocs(q);
             if (snapshot.empty) {
                await addDoc(companiesRef, companyData);
            }
         } catch (e) {
             console.warn("Cache failed", e);
         }
         return companyData;
      }

      return null;
    } catch (e) {
      console.error("Proxy Search Error:", e);
      return null;
    }
  },

  getFinancials: async (oib: string) => {
      // Mock or fetch logic
      return [];
  }
};

export default CompanyService;
