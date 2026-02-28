document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.stained-glass-window');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Animate traffic light in Simple Signals 2
    const trafficLightPane = document.getElementById('simple-signals-2');
    const lights = trafficLightPane?.querySelectorAll('.light');
    
    if (lights) {
        let currentLight = 0;
        
        function animateTrafficLight() {
            // Check if this tab is active
            if (trafficLightPane.classList.contains('active')) {
                lights.forEach(light => light.classList.remove('active'));
                
                // Cycle through: red -> yellow -> green
                lights[currentLight].classList.add('active');
                currentLight = (currentLight + 1) % lights.length;
            }
        }
        
        // Animate every 2 seconds
        setInterval(animateTrafficLight, 2000);
        
        // Start animation when tab becomes active
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (trafficLightPane.classList.contains('active')) {
                        animateTrafficLight();
                    }
                }
            });
        });
        
        observer.observe(trafficLightPane, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Google Maps of Hiring - Data Integration
    let allRecords = [];
    const searchInput = document.getElementById('hiring-search');
    const entityFilter = document.getElementById('entity-filter');
    const recordsContainer = document.getElementById('records-container');
    const noResults = document.getElementById('no-results');

    // Helper function to create searchable text from an object
    function createSearchText(obj) {
        if (!obj || typeof obj !== 'object') return '';
        
        const searchableValues = [];
        
        // Recursively collect all string and number values
        function collectValues(val, depth = 0) {
            if (depth > 5) return; // Prevent infinite recursion
            if (val === null || val === undefined) return;
            
            if (typeof val === 'string' || typeof val === 'number') {
                searchableValues.push(String(val));
            } else if (Array.isArray(val)) {
                val.forEach(item => collectValues(item, depth + 1));
            } else if (typeof val === 'object') {
                Object.values(val).forEach(item => collectValues(item, depth + 1));
            }
        }
        
        collectValues(obj);
        return searchableValues.join(' ').toLowerCase();
    }

    // Load and process consolidated data
    async function loadHiringData() {
        try {
            const data = await getConsolidatedData();
            allRecords = [];
            
            // Flatten nested data structure
            if (data.data) {
                // Process companies (which contain nested job_postings)
                if (data.data.company) {
                    Object.values(data.data.company).forEach(company => {
                        allRecords.push({
                            type: 'company',
                            id: company.company_id,
                            title: company.company_name,
                            data: company,
                            searchText: createSearchText(company)
                        });
                        
                        // Process nested job postings
                        if (company.job_postings && Array.isArray(company.job_postings)) {
                            company.job_postings.forEach(job => {
                                allRecords.push({
                                    type: 'job_posting',
                                    id: job.job_posting_id,
                                    title: job.job_title,
                                    data: job,
                                    parent: company.company_name,
                                    searchText: createSearchText(job)
                                });
                                
                                // Process nested promises
                                if (job.promises && Array.isArray(job.promises)) {
                                    job.promises.forEach(promise => {
                                        allRecords.push({
                                            type: 'promise',
                                            id: promise.promise_id,
                                            title: promise.promise_text || promise.promise_type,
                                            data: promise,
                                            parent: `${company.company_name} → ${job.job_title}`,
                                            searchText: createSearchText(promise)
                                        });
                                    });
                                }
                                
                                // Process nested personal vouches
                                if (job.personal_vouches && Array.isArray(job.personal_vouches)) {
                                    job.personal_vouches.forEach(pvouch => {
                                        allRecords.push({
                                            type: 'personal_vouch',
                                            id: pvouch.vouch_id,
                                            title: pvouch.vouch_statement || pvouch.claim_type,
                                            data: pvouch,
                                            parent: `${company.company_name} → ${job.job_title}`,
                                            searchText: createSearchText(pvouch)
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
                
                // Process standalone job postings (if any exist at top level)
                if (data.data.job_posting) {
                    Object.values(data.data.job_posting).forEach(job => {
                        allRecords.push({
                            type: 'job_posting',
                            id: job.job_posting_id,
                            title: job.job_title,
                            data: job,
                            searchText: createSearchText(job)
                        });
                    });
                }
                
                // Process standalone promises (if any exist at top level)
                if (data.data.promise) {
                    Object.values(data.data.promise).forEach(promise => {
                        allRecords.push({
                            type: 'promise',
                            id: promise.promise_id,
                            title: promise.promise_text || promise.promise_type,
                            data: promise,
                            searchText: createSearchText(promise)
                        });
                    });
                }
                
                // Process vouches
                if (data.data.vouch) {
                    Object.values(data.data.vouch).forEach(vouch => {
                        allRecords.push({
                            type: 'vouch',
                            id: vouch.vouch_id,
                            title: vouch.vouch_statement || vouch.claim_type,
                            data: vouch,
                            searchText: createSearchText(vouch)
                        });
                    });
                }
                
                // Process standalone personal vouches (if any exist at top level)
                if (data.data.personal_vouch) {
                    Object.values(data.data.personal_vouch).forEach(pvouch => {
                        allRecords.push({
                            type: 'personal_vouch',
                            id: pvouch.vouch_id,
                            title: pvouch.vouch_statement || pvouch.claim_type,
                            data: pvouch,
                            searchText: createSearchText(pvouch)
                        });
                    });
                }
            }
            
            displayRecords(allRecords);
        } catch (error) {
            console.error('Error loading data:', error);
            recordsContainer.innerHTML = `<div class="error-message">Error loading data: ${error.message}</div>`;
        }
    }

    // Display records
    function displayRecords(records) {
        if (records.length === 0) {
            recordsContainer.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        recordsContainer.style.display = 'block';
        noResults.style.display = 'none';
        
        recordsContainer.innerHTML = records.map(record => {
            const typeLabels = {
                company: '🏢 Company',
                job_posting: '💼 Job Posting',
                promise: '🤝 Promise',
                vouch: '⭐ Vouch',
                personal_vouch: '👤 Personal Vouch'
            };
            
            const typeColors = {
                company: 'rgba(74, 144, 226, 0.3)',
                job_posting: 'rgba(40, 167, 69, 0.3)',
                promise: 'rgba(255, 193, 7, 0.3)',
                vouch: 'rgba(255, 140, 0, 0.3)',
                personal_vouch: 'rgba(220, 53, 69, 0.3)'
            };
            
            let details = [];
            const data = record.data;
            
            if (record.type === 'company') {
                if (data.domain) details.push(`Domain: ${data.domain}`);
                if (data.industry) details.push(`Industry: ${data.industry}`);
                if (data.location) details.push(`Location: ${data.location}`);
            } else if (record.type === 'job_posting') {
                if (data.location) details.push(`Location: ${data.location}`);
                if (data.employment_type) details.push(`Type: ${data.employment_type}`);
                if (data.advertised_salary_min) {
                    details.push(`Salary: ${data.advertised_salary_currency || 'USD'} ${data.advertised_salary_min.toLocaleString()}+`);
                }
                if (data.posted_date) details.push(`Posted: ${data.posted_date}`);
            } else if (record.type === 'promise') {
                if (data.promise_type) details.push(`Type: ${data.promise_type}`);
                if (data.promised_timeline_days) details.push(`Timeline: ${data.promised_timeline_days} days`);
                if (data.promised_value_min) details.push(`Value: ${data.promised_value_min.toLocaleString()}`);
            } else if (record.type === 'vouch' || record.type === 'personal_vouch') {
                if (data.claim_type) details.push(`Claim: ${data.claim_type}`);
                if (data.source_seniority) details.push(`Seniority: ${data.source_seniority}`);
                if (data.vouch_weight) details.push(`Weight: ${data.vouch_weight}`);
                if (data.valid_from) details.push(`Valid from: ${data.valid_from}`);
                if (record.type === 'personal_vouch' && data.voucher_relationship) {
                    details.push(`Relationship: ${data.voucher_relationship}`);
                }
            }
            
            return `
                <div class="record-card" style="border-color: ${typeColors[record.type]};">
                    <div class="record-header">
                        <span class="record-type" style="background: ${typeColors[record.type]};">${typeLabels[record.type]}</span>
                    </div>
                    ${record.parent ? `<div class="record-parent">${record.parent}</div>` : ''}
                    <h3 class="record-title">${record.title || record.id}</h3>
                    ${details.length > 0 ? `<div class="record-details">${details.join(' • ')}</div>` : ''}
                    ${data.description || data.vouch_statement ? `<p class="record-description">${data.description || data.vouch_statement}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    // Filter and search records
    function filterRecords() {
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const entityType = entityFilter?.value || '';
        
        let filtered = allRecords;
        
        if (entityType) {
            filtered = filtered.filter(r => r.type === entityType);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(r => r.searchText.includes(searchTerm));
        }
        
        displayRecords(filtered);
    }

    // Set up event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterRecords);
    }
    
    if (entityFilter) {
        entityFilter.addEventListener('change', filterRecords);
    }

    // Load data when Google Maps tab becomes active
    const googleMapsPane = document.getElementById('google-maps');
    if (googleMapsPane) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (googleMapsPane.classList.contains('active') && allRecords.length === 0) {
                        loadHiringData();
                    }
                }
            });
        });
        
        observer.observe(googleMapsPane, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});
