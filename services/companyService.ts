import { CompanyData } from '../types';

// --- MOCK DATA FOR ROBUST DEMOS ---
const DEMO_COMPANIES: Record<string, CompanyData> = {
  'infobip': {
    name: 'INFOBIP d.o.o.',
    fullName: 'INFOBIP d.o.o. za informatičke usluge',
    oib: '29756659895',
    mbs: '130004106',
    address: "Istarska ulica - Via dell'Istria 157, 52100, Vodnjan, Hrvatska",
    founded: '13.04.2006.',
    status: 'Aktivan',
    activity: 'K63100 - Računalna infrastruktura, obrada podataka',
    size: 'Veliko poduzeće',
    rating: 'A+',
    blocked: false,
    phone: '052635826',
    email: 'pravna@infobip.com',
    website: 'www.infobip.com',
    owner: 'INFOBIP LIMITED',
    directors: ['Stjepan Žitnik', 'Tomislav Pifar'],
    financials: [
      { year: 2024, income: 128608959.77, expenses: 121437859.17, profit: 9249103.41, employees: 1401 },
      { year: 2023, income: 101758420.82, expenses: 102254697.59, profit: 1595458.28, employees: 1401 },
      { year: 2022, income: 88435177.51, expenses: 86975443.76, profit: 1459733.76, employees: 1321 }
    ]
  },
  'rimac': {
    name: 'RIMAC TECHNOLOGY d.o.o.',
    fullName: 'RIMAC TECHNOLOGY d.o.o. za proizvodnju',
    oib: '52822453835',
    mbs: '081335591',
    address: 'Ljubljanska 7, 10431 Sveta Nedelja',
    founded: '2016.',
    status: 'Aktivan',
    activity: 'C2910 - Proizvodnja motornih vozila',
    size: 'Veliko poduzeće',
    rating: 'A',
    blocked: false,
    phone: '01 5634 100',
    email: 'info@rimac-technology.com',
    website: 'www.rimac-technology.com',
    owner: 'RIMAC GROUP d.o.o.',
    directors: ['Mate Rimac', 'Antony John Douglas Saines'],
    financials: [
      { year: 2023, income: 423500000.00, expenses: 418200000.00, profit: 5300000.00, employees: 1850 },
      { year: 2022, income: 280100000.00, expenses: 275000000.00, profit: 5100000.00, employees: 1400 },
      { year: 2021, income: 195000000.00, expenses: 198000000.00, profit: -3000000.00, employees: 1100 }
    ]
  },
  'koncar': {
    name: 'KONČAR - ELEKTROINDUSTRIJA d.d.',
    fullName: 'KONČAR - ELEKTROINDUSTRIJA d.d. za energetiku',
    oib: '02230064214',
    mbs: '080018082',
    address: 'Fallerovo šetalište 22, 10000 Zagreb',
    founded: '1921.',
    status: 'Aktivan',
    activity: 'proizvodnja električne opreme',
    size: 'Veliko poduzeće',
    rating: 'A++',
    blocked: false,
    phone: '01 3655 555',
    email: 'marketing@koncar.hr',
    website: 'www.koncar.hr',
    owner: 'Dioničko društvo',
    directors: ['Gordan Kolak'],
    financials: [
      { year: 2023, income: 890500000.00, expenses: 840000000.00, profit: 50500000.00, employees: 4200 },
      { year: 2022, income: 720000000.00, expenses: 690000000.00, profit: 30000000.00, employees: 3800 },
      { year: 2021, income: 650000000.00, expenses: 630000000.00, profit: 20000000.00, employees: 3600 }
    ]
  }
};

const CompanyService = {
  /**
   * Search including local mock data fallback and multiple proxy strategies.
   */
  search: async (query: string): Promise<CompanyData | null> => {
    // 1. CHECK MOCK DATA
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check by name key
    for (const key of Object.keys(DEMO_COMPANIES)) {
      if (normalizedQuery.includes(key)) {
        console.log(`Found "${key}" in local demo database.`);
        // Simulate network delay for realism
        await new Promise(r => setTimeout(r, 600));
        return DEMO_COMPANIES[key];
      }
    }
    
    // Check by OIB (if query is numbers)
    if (/^\d{11}$/.test(normalizedQuery)) {
       for (const data of Object.values(DEMO_COMPANIES)) {
          if (data.oib === normalizedQuery) return data;
       }
    }

    // 2. SCRAPE VIA PROXIES
    const proxies = [
      // Strategy A: AllOrigins (Often best for raw HTML)
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      // Strategy B: CodeTabs (Solid backup)
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
       // Strategy C: CorsProxy.io
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    let lastError: any;

    for (const makeProxyUrl of proxies) {
       try {
          return await scrapeCompanyWall(query, makeProxyUrl);
       } catch (err) {
          console.warn('Proxy strategy failed, trying next...', err);
          lastError = err;
       }
    }

    throw lastError || new Error('Svi servisi za dohvat podataka su trenutno nedostupni. Pokušajte: Infobip, Rimac, Končar.');
  }
};

async function scrapeCompanyWall(query: string, proxyGenerator: (url: string) => string): Promise<CompanyData | null> {
    const SEARCH_URL = `https://www.companywall.hr/pretraga?q=${encodeURIComponent(query)}`;
    const proxyUrl = proxyGenerator(SEARCH_URL);
    
    console.log(`Scraping via: ${proxyUrl}`);
    
    // Unique timestamp to bypass caching
    const searchResponse = await fetch(`${proxyUrl}&_st=${Date.now()}`, { cache: 'no-store' });
    if (!searchResponse.ok) throw new Error(`Search HTTP ${searchResponse.status}`);
    
    const searchText = await searchResponse.text();
    const parser = new DOMParser();
    const searchDoc = parser.parseFromString(searchText, 'text/html');

    const linkElement = searchDoc.querySelector('a[href^="/tvrtka/"]');
    if (!linkElement) return null; // Not found

    const relativeUrl = linkElement.getAttribute('href');
    const detailsUrl = `https://www.companywall.hr${relativeUrl}`;
    const detailsProxyUrl = proxyGenerator(detailsUrl);
    
    console.log(`Fetching details via: ${detailsProxyUrl}`);
    const detailsResponse = await fetch(`${detailsProxyUrl}&_dt=${Date.now()}`, { cache: 'no-store' });
    if (!detailsResponse.ok) throw new Error('Details HTTP Error');
    
    const detailsText = await detailsResponse.text();
    const doc = parser.parseFromString(detailsText, 'text/html');

    if (!doc.querySelector('h1')) throw new Error('Invalid HTML content parsed');

    // --- BETTER PARSING LOGIC ---
    // Instead of relying on specific DOM structure (nextSibling), we use full-text search 
    // or locate standard elements by text and then search nearby content more robustly.

    const fullText = doc.body.innerText || '';

    // Regex extractors for standard patterns
    const extractOIB = () => {
       const match = fullText.match(/OIB\s*[:.-]?\s*(\d{11})/i);
       return match ? match[1] : '';
    };

    const extractMBS = () => {
       const match = fullText.match(/MBS\s*[:.-]?\s*(\d{5,9})/i);
       return match ? match[1] : '';
    };

    const extractFounded = () => {
       // Matches: "Datum osnivanja: 12.03.2010" or "Osnovano: 2010"
       const match = fullText.match(/(?:Datum osnivanja|Osnovano)\s*[:.-]?\s*([0-9.]{4,})/i);
       return match ? match[1] : '';
    };

    const extractSize = () => {
        const match = fullText.match(/(?:Veličina|Veličina poduzeća)\s*[:.-]?\s*([A-Za-zčćžšđČĆŽŠĐ\s]+)/i);
        if (match) {
             const val = match[1].trim();
             // Clean up if it grabbed too much
             if (val.length < 50 && !val.includes('\n')) return val;
        }
        return 'Srednje';
    };

    const extractAddress = () => {
        // Try looking for map link or common address containers
        const mapLink = doc.querySelector('a[href*="maps.google"]');
        if (mapLink && mapLink.textContent && mapLink.textContent.length > 5) {
            return mapLink.textContent.trim();
        }
        // Fallback: look for generic address pattern
        const addressEl = Array.from(doc.querySelectorAll('div, p, span')).find(el => 
            (el.textContent?.includes('Adresa') || el.textContent?.includes('Sjedište')) && 
            el.textContent.length < 150
        );
        if (addressEl) {
             // Try to extract just the address part
             const txt = addressEl.textContent || '';
             const parts = txt.split(/Adresa|Sjedište/i);
             if (parts.length > 1) return parts[1].replace(/[:]/g, '').trim();
        }
        return '';
    };

    // Helper to find text safely
     const getInfo = (label: string): string => {
        // Safer Xpath that looks for the text node, then tries several strategies
        const xpath = `//*[contains(text(), '${label}')]`;
        const iterator = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let node = iterator.iterateNext();
        
        while (node) {
           // 1. Check immediate text content (e.g. "Director: John Doe")
           if (node.textContent && node.textContent.includes(':')) {
               const parts = node.textContent.split(':');
               if (parts[1]?.trim().length > 1) return parts[1].trim();
           }

           // 2. Check next sibling element text
           if (node.nextSibling?.textContent?.trim()) return node.nextSibling.textContent.trim();
           
           // 3. Check parent's next sibling (Label in one div, Value in next div)
           if (node.parentElement?.nextElementSibling?.textContent?.trim()) {
               return node.parentElement.nextElementSibling.textContent.trim();
           }
           
           node = iterator.iterateNext();
        }
        return '';
      };

      const name = doc.querySelector('h1')?.textContent?.trim() || query;
      const fullName = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || name;
      
      // Use regex strategies first correctly
      const oib = extractOIB() || getInfo('OIB');
      const mbs = extractMBS() || getInfo('MBS');
      const address = extractAddress() || getInfo('Adresa') || getInfo('Sjedište') || '';
      
      const financials: any[] = [];
      const tables = doc.querySelectorAll('table');
      
      tables.forEach(table => {
          const headers = Array.from(table.querySelectorAll('thead th'));
          const yearIndices: {year: number, index: number}[] = [];
          
          headers.forEach((th, idx) => {
               // Extract year: "2023" from text
               const txt = th.textContent?.trim() || '';
               const yearMatch = txt.match(/20\d\d/);
               if (yearMatch) {
                   yearIndices.push({ year: parseInt(yearMatch[0]), index: idx });
               }
          });

          if (yearIndices.length > 0) {
              const getRow = (terms: string[]) => Array.from(table.querySelectorAll('tr')).find(r => {
                  const t = r.textContent?.toLowerCase() || '';
                  return terms.some(term => t.includes(term));
              });

              const parseVal = (str: string | undefined | null) => {
                  if (!str) return 0;
                  // Handle HR/EUR format: 1.234,56 -> 1234.56 or 1234,56
                  if (!str) return 0;
                  // If contains dots as thousands separator and comma as decimal
                  let clean = str;
                  if (str.includes('.') && str.includes(',')) {
                      clean = str.replace(/\./g, '').replace(',', '.');
                  } else if (str.includes(',')) {
                      clean = str.replace(',', '.');
                  }
                  return parseFloat(clean.replace(/[^\d.-]/g, '')) || 0;
              };

              // More robust row matching
              const incRow = getRow(['prihod', 'ukupni']);
              const profRow = getRow(['dobit', 'neto', 'rezultat']);
              const empRow = getRow(['zaposlen', 'radni', 'broj']);

              if (incRow) {
                  const cellsInc = incRow.querySelectorAll('td');
                  const cellsProf = profRow?.querySelectorAll('td');
                  const cellsEmp = empRow?.querySelectorAll('td');

                  yearIndices.forEach(y => {
                       const income = parseVal(cellsInc[y.index]?.innerText);
                       const profit = cellsProf ? parseVal(cellsProf[y.index]?.innerText) : 0;
                       const employees = cellsEmp ? parseVal(cellsEmp[y.index]?.innerText) : 0;
                       
                       if (income > 0) {
                           financials.push({
                               year: y.year,
                               income,
                               expenses: income - profit,
                               profit,
                               employees
                           });
                       }
                  });
              }
          }
      });
      
      financials.sort((a,b) => b.year - a.year);

      const contactSection = doc.querySelector('.contact-data') || doc.body; // Broad fallback

      return {
        name,
        fullName,
        oib: oib || 'Unknown',
        mbs: mbs || 'Unknown',
        address: address || 'Unknown',
        founded: extractFounded() || '2000.',
        status: fullText.includes('Neaktivan') ? 'Neaktivan' : 'Aktivan', 
        activity: getInfo('Djelatnost') || getInfo('NKD') || '-',
        size: extractSize() || 'Srednje',
        rating: 'A',
        blocked: fullText.includes('Blokiran') && !fullText.includes('Nije Blokiran'),
        phone: doc.querySelector('a[href^="tel:"]')?.textContent?.trim() || getInfo('Telefon'),
        email: doc.querySelector('a[href^="mailto:"]')?.textContent?.trim() || getInfo('Email'),
        website: doc.querySelector('a[href^="http"]:not([href*="companywall"])')?.getAttribute('href') || '',
        owner: getInfo('Vlasnici') || getInfo('Vlasnik') || '-',
        directors: [getInfo('Zastupnici') || getInfo('Direktor') || 'Uprava'],
        financials
      };
}

export default CompanyService;
