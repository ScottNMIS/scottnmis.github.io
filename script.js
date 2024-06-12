document.addEventListener('DOMContentLoaded', () => {
    loadProductData();
    setupTabs();
});

function setupTabs() {
    const topTabLinks = document.querySelectorAll('.tab-link');
    const topTabContents = document.querySelectorAll('.container.tab-content');

    topTabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetTab = event.target.dataset.tab;

            topTabLinks.forEach(link => link.classList.remove('active'));
            topTabContents.forEach(content => content.style.display = 'none');

            event.target.classList.add('active');
            document.getElementById(targetTab).style.display = 'block';
        });
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function loadProductData() {
    fetch('DigitalProductPassport.json')
        .then(response => response.json())
        .then(data => {
            const product = data;
            if (product) {
                document.getElementById('passport-id').textContent = product.metadata.passportIdentifier;
                document.getElementById('model-number').textContent = product.identification.type.manufacturerPartId;
                document.getElementById('serial-number').textContent = product.identification.serial[0].value;

                populateAllSection(product);
                populateGeneralSection(product);
                populateMaterialComposition(product);
                populatePerformance(product);
                populateCompliance(product);
                populateSupplyChain(product);
                populateCircularity(product);
                populateCarbonFootprint(product);

                document.getElementById('product-passport').style.display = 'block';
                document.querySelector('.tab-button.active').click();

                document.getElementById('xml-content').value = JSON.stringify(data, null, 2);
            } else {
                console.error('Product not found in JSON');
            }
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
}

function populateAllSection(product) {
    const allFields = [];
    allFields.push(`<div class="data-field"><strong>Passport ID:</strong> <span>${product.metadata.passportIdentifier}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Model Number:</strong> <span>${product.identification.type.manufacturerPartId}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Serial Number:</strong> <span>${product.identification.serial[0].value}</span></div>`);
    allFields.push(`<div class="data-field"><strong>General Performance Class:</strong> <span>${product.characteristics.generalPerformanceClass}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Physical State:</strong> <span>${product.characteristics.physicalState}</span></div>`);
    const materials = product.materials.materialComposition.content;
    materials.forEach(material => {
        allFields.push(`<div class="data-field"><strong>${material.id[0].name}:</strong> <span>${material.concentration}</span></div>`);
    });
    allFields.push(`<div class="data-field"><strong>Volume:</strong> <span>${product.characteristics.physicalDimension.volume.value} ${product.characteristics.physicalDimension.volume.unit}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Compliance Standard:</strong> <span>${product.identification.classification[0].classificationStandard}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Manufacturer:</strong> <span>${product.operation.manufacturer.manufacturer}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Reparability Score:</strong> <span>${product.sustainability.reparabilityScore}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Carbon Footprint:</strong> <span>${product.sustainability.productFootprint.carbon[0].value} ${product.sustainability.productFootprint.carbon[0].unit}</span></div>`);
    populateTab('all', allFields.join(''));
}

function populateGeneralSection(product) {
    const generalFields = [];
    generalFields.push(`<div class="data-field"><strong>General Performance Class:</strong> <span>${product.characteristics.generalPerformanceClass}</span></div>`);
    generalFields.push(`<div class="data-field"><strong>Physical State:</strong> <span>${product.characteristics.physicalState}</span></div>`);
    populateTab('general', generalFields.join(''));
}

function populateMaterialComposition(product) {
    const materials = product.materials.materialComposition.content;
    const materialFields = [];
    materials.forEach(material => {
        materialFields.push(`<div class="data-field"><strong>${material.id[0].name}:</strong> <span>${material.concentration}</span></div>`);
    });
    populateTab('material-composition', materialFields.join(''));
}

function populatePerformance(product) {
    const performanceFields = [];
    performanceFields.push(`<div class="data-field"><strong>Volume:</strong> <span>${product.characteristics.physicalDimension.volume.value} ${product.characteristics.physicalDimension.volume.unit}</span></div>`);
    populateTab('performance', performanceFields.join(''));
}

function populateCompliance(product) {
    const complianceFields = [];
    complianceFields.push(`<div class="data-field"><strong>Compliance Standard:</strong> <span>${product.identification.classification[0].classificationStandard}</span></div>`);
    populateTab('compliance', complianceFields.join(''));
}

function populateSupplyChain(product) {
    const supplyChainFields = [];
    supplyChainFields.push(`<div class="data-field"><strong>Manufacturer:</strong> <span>${product.operation.manufacturer.manufacturer}</span></div>`);
    populateTab('supply-chain', supplyChainFields.join(''));
}

function populateCircularity(product) {
    const circularityFields = [];
    circularityFields.push(`<div class="data-field"><strong>Reparability Score:</strong> <span>${product.sustainability.reparabilityScore}</span></div>`);
    populateTab('circularity', circularityFields.join(''));
}

function populateCarbonFootprint(product) {
    const carbonFootprintFields = [];
    carbonFootprintFields.push(`<div class="data-field"><strong>Carbon Footprint:</strong> <span>${product.sustainability.productFootprint.carbon[0].value} ${product.sustainability.productFootprint.carbon[0].unit}</span></div>`);
    populateTab('carbon-footprint', carbonFootprintFields.join(''));
}

function populateTab(tabId, fieldsHtml) {
    document.getElementById(tabId).innerHTML = `<div class="tab-content-inner">${fieldsHtml}</div>`;
}

document.getElementById('access-code-button').addEventListener('click', () => {
    const participantName = document.getElementById('participant-name').value;
    const companyName = document.getElementById('company-name').value;
    if (!participantName || !companyName) {
        alert('Please enter both the participant name and company name');
        return;
    }
    localStorage.setItem('participantName', participantName);
    localStorage.setItem('companyName', companyName);
    document.getElementById('access-code-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
});

document.getElementById('search-button').addEventListener('click', () => {
    const participantName = localStorage.getItem('participantName');
    const searchTerm = document.getElementById('search-term').value;
    const xmlContent = document.getElementById('xml-content').value;
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    displayLoadingState(true);
    fetchFakeData(participantName, searchTerm, xmlContent);
});

function fetchFakeData(participantName, searchTerm, xmlContent) {
    fetch('/.netlify/functions/getApiKey')
        .then(response => response.json())
        .then(apiKeyData => {
            const apiKey = apiKeyData.apiKey;

            const prompt = `Here is the digital product passport data: ${xmlContent}. Generate a realistic output answer for the following variable: ${searchTerm}. If the data does not exist, create realistic fake data that would fit with the existing parameters.`;
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'system', content: 'You are a digital product passport data assistant and should only respond with realistic data that would be found in a digital product passport. If you do not know the answer, generate a realistic sounding answer based on the available information. Do not include code or tags within the response, only the value of the requested data in the same structure as the provided data.' }, { role: 'user', content: prompt }],
                    max_tokens: 200
                })
            })
            .then(response => response.json())
            .then(data => {
                const responseContent = data.choices[0].message.content.trim();
                document.getElementById('api-response').textContent = responseContent;

                const dataToSave = {
                    participantName: participantName,
                    searchTerm: searchTerm,
                    aiResponse: responseContent,
                    timestamp: new Date().toISOString(),
                };

                saveData(dataToSave);

                displayLoadingState(false);
            })
            .catch(error => {
                console.error('Error accessing the API:', error);
                document.getElementById('api-response').textContent = 'Error accessing the API. Please try again later.';
                displayLoadingState(false);
            });
        })
        .catch(error => {
            console.error('Error fetching the API key:', error);
            document.getElementById('api-response').textContent = 'Error fetching the API key. Please try again later.';
            displayLoadingState(false);
        });
}

function saveData(data) {
    fetch('/.netlify/functions/saveData', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        return response.json().then(result => {
            if (!response.ok) {
                console.error('Error saving data: ' + result.message);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayLoadingState(isLoading) {
    const searchButton = document.getElementById('search-button');
    const apiResponse = document.getElementById('api-response');
    if (isLoading) {
        searchButton.disabled = true;
        apiResponse.textContent = 'Searching DPP...';
    } else {
        searchButton.disabled = false;
    }
}
