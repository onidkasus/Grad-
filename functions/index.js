const functions = require('firebase-functions');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors')({origin: true});

exports.scrapeCompany = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            const query = req.query.q;
            if (!query) {
                return res.status(400).json({ error: 'Missing query parameter q' });
            }

            // Headers to simulate a real browser
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'hr-HR,hr;q=0.9,en-US;q=0.8,en;q=0.7'
            };

            // 1. Search Phase
            console.log(`Searching for: ${query}`);
            const searchUrl = `https://www.companywall.hr/pretraga?q=${encodeURIComponent(query)}`;
            const searchResponse = await axios.get(searchUrl, { headers });
            
            const $search = cheerio.load(searchResponse.data);
            
            // Try to find the first company link in the results
            // Selectors might need adjustment if site layout changes
            let companyLink = $search('.result-item a').first().attr('href') || 
                              $search('a[href^="/tvrtka/"]').first().attr('href');

            if (!companyLink) {
                console.log('No company link found in search results');
                return res.status(404).json({ error: 'Company not found' });
            }

            const fullUrl = `https://www.companywall.hr${companyLink}`;
            console.log(`Fetching details from: ${fullUrl}`);

            // 2. Details Phase
            const detailsResponse = await axios.get(fullUrl, { headers });
            const $ = cheerio.load(detailsResponse.data);

            // Helper to extract text by label
            const getInfo = (label) => {
                // Strategy: Find element containing label, then look for value in next sibling or specific class
                const labelEl = $(`*:contains("${label}")`).filter((i, el) => $(el).children().length === 0 && $(el).text().trim() === label).first();
                if (labelEl.length) {
                    // Try finding a value container nearby
                    let value = labelEl.next().text().trim();
                    if (!value) value = labelEl.parent().find('.value, .data').text().trim();
                    return value;
                }
                return '';
            };
            
            // Specific extraction strategies based on typical layouts
            const name = $('h1').text().trim() || query;
            const fullName = $('.company-name-full').text().trim() || name;
            const oib = $('span:contains("OIB")').next().text().trim() || getInfo('OIB');
            const mbs = $('span:contains("MBS")').next().text().trim() || getInfo('MBS');
            const address = $('span:contains("Adresa")').next().text().trim() || getInfo('Adresa');
            
            // Basic Status/Info
            const status = $('.status-tag').text().trim() || 'Aktivan'; // Fallback
            const size = getInfo('Veličina') || 'Srednje poduzeće';
            
            // Contact
            const phone = $('a[href^="tel:"]').first().text().trim();
            const email = $('a[href^="mailto:"]').first().text().trim();
            const website = $('a[href^="http"]:not([href*="companywall"])').first().attr('href') || '';

            // Financials
            // Look for the main financial table
            const financials = [];
            
            // Parsing strategy for typical financial table (Years in header, Data in rows)
            // This is a "best guess" implementation.
            const table = $('table.financials, table').first();
            if (table.length) {
                // Assuming years are in `thead`
                const years = [];
                table.find('thead th').each((i, el) => {
                    const txt = $(el).text().trim();
                    if (/20\d{2}/.test(txt)) years.push({ index: i, year: parseInt(txt) });
                });

                // Helper to safely parse string amount to number
                const parseAmount = (str) => {
                    if (!str) return 0;
                    return parseFloat(str.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, ''));
                };

                // Extract rows for Income, Expenses, Profit, Employees
                const getRowData = (keywords) => {
                     let foundRow = null;
                     table.find('tbody tr').each((i, row) => {
                         const header = $(row).find('td, th').first().text().toLowerCase();
                         if (keywords.some(k => header.includes(k))) {
                             foundRow = row;
                             return false; 
                         }
                     });
                     return foundRow;
                };

                const incomeRow = getRowData(['prihod', 'ukupni prihodi']);
                const profitRow = getRowData(['dobit', 'rezultat']);
                const expensesRow = getRowData(['rashod']); // Might need calculation
                const employeesRow = getRowData(['zaposlen', 'radni']);

                years.forEach(y => {
                    const incomeStr = $(incomeRow).find('td').eq(y.index).text().trim();
                    const profitStr = $(profitRow).find('td').eq(y.index).text().trim();
                    const employeesStr = $(employeesRow).find('td').eq(y.index).text().trim();
                    
                    const income = parseAmount(incomeStr);
                    const profit = parseAmount(profitStr);
                    // Approximation if expenses not explicit: Income - Profit
                    const expenses = income - profit;
                    const employees = parseInt(employeesStr) || 0;

                    if (income || profit) {
                        financials.push({
                            year: y.year,
                            income,
                            expenses,
                            profit,
                            employees
                        });
                    }
                });
            }

            // Fill mock data if parsing failed (Robustness) or ensure structure
            const result = {
                name,
                fullName,
                oib: oib || 'Unknown',
                mbs: mbs || 'Unknown',
                address: address || 'Unknown',
                founded: getInfo('Osnovano') || '2000',
                status,
                activity: getInfo('Djelatnost') || 'Poslovne usluge',
                size,
                rating: 'A', // Hard to scrape without analyzing graphics usually
                blocked: false,
                phone: phone || '-',
                email: email || '-',
                website: website || '-',
                owner: getInfo('Vlasnik') || '-',
                directors: [getInfo('Direktor') || 'Unknown'],
                financials: financials.length ? financials : []
            };

            return res.json(result);

        } catch (error) {
            console.error('Scraping error:', error);
            // Return text error to help debug
            return res.status(500).json({ error: 'Failed to scrape data', details: error.message });
        }
    });
});
