document.addEventListener('DOMContentLoaded', () => {
    loadProductData();
});

function loadProductData() {
    fetch('dpp.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');

            const product = xmlDoc.querySelector('product');
            if (product) {
                document.getElementById('passport-id').textContent = product.querySelector('passportID').textContent;
                document.getElementById('model-number').textContent = product.querySelector('modelNumber').textContent;
                document.getElementById('serial-number').textContent = product.querySelector('serialNumber').textContent;

                // Set the otherLogo image source
                const otherLogoElement = product.querySelector('otherLogo');
                if (otherLogoElement) {
                    document.getElementById('other-logo').src = otherLogoElement.textContent;
                }

                populateGeneralSection(product);
                populateMaterialComposition(product);
                populatePerformance(product);
                populateCompliance(product);
                populateSupplyChain(product);
                populateCircularity(product);
                populateCarbonFootprint(product);

                document.getElementById('product-passport').style.display = 'block';
                document.querySelector('.tab-button').click();

                // Store the entire XML content for later use in API request
                document.getElementById('xml-content').value = data;
            } else {
                console.error('Product not found in XML');
            }
        })
        .catch(error => {
            console.error('Error loading XML:', error);
        });
}

function populateGeneralSection(product) {
    const generalFields = [];
    product.querySelectorAll(':scope > *:not(materials):not(standards):not(supplyChainSteps):not(recyclingInfo):not(carbonEmissions)').forEach(child => {
        generalFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(child.nodeName)}:</strong> <span>${capitalizeFirstLetter(child.textContent)}</span></div>`);
    });
    populateTab('general', generalFields.join(''));
}

function populateMaterialComposition(product) {
    const materials = product.querySelectorAll('materials material');
    const materialFields = [];
    materials.forEach(material => {
        materialFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(material.querySelector('name').textContent)}:</strong> <span>${capitalizeFirstLetter(material.querySelector('percentage').textContent)}</span></div>`);
    });
    populateTab('material-composition', materialFields.join(''));
}

function populatePerformance(product) {
    const performanceFields = [];
    const performanceElements = ['capacity', 'voltage'];
    performanceElements.forEach(el => {
        const element = product.querySelector(el);
        if (element) {
            performanceFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(el)}:</strong> <span>${capitalizeFirstLetter(element.textContent)}</span></div>`);
        }
    });
    populateTab('performance', performanceFields.join(''));
}

function populateCompliance(product) {
    const standards = product.querySelectorAll('standards standard');
    const complianceFields = [];
    standards.forEach(standard => {
        complianceFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(standard.querySelector('name').textContent)}:</strong> <span>${capitalizeFirstLetter(standard.querySelector('description').textContent)}</span></div>`);
    });
    populateTab('compliance', complianceFields.join(''));
}

function populateSupplyChain(product) {
    const supplyChainSteps = product.querySelectorAll('supplyChainSteps step');
    const supplyChainFields = [];
    supplyChainSteps.forEach(step => {
        supplyChainFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(step.querySelector('name').textContent)}:</strong> <span>${capitalizeFirstLetter(step.querySelector('location').textContent)}</span></div>`);
    });
    populateTab('supply-chain', supplyChainFields.join(''));
}

function populateCircularity(product) {
    const recyclingInfo = product.querySelector('recyclingInfo');
    const circularityFields = [];
    if (recyclingInfo) {
        recyclingInfo.querySelectorAll(':scope > *').forEach(child => {
            circularityFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(child.nodeName)}:</strong> <span>${capitalizeFirstLetter(child.textContent)}</span></div>`);
        });
    }
    populateTab('circularity', circularityFields.join(''));
}

function populateCarbonFootprint(product) {
    const emissions = product.querySelectorAll('carbonEmissions emission');
    const emissionFields = [];
    emissions.forEach(emission => {
        emissionFields.push(`<div class="data-field"><strong>${capitalizeFirstLetter(emission.querySelector('phase').textContent)}:</strong> <span>${capitalizeFirstLetter(emission.querySelector('value').textContent)}</span></div>`);
    });
    populateTab('carbon-footprint', emissionFields.join(''));
}

function populateTab(tabId, fieldsHtml) {
    document.getElementById(tabId).innerHTML = `<div class="tab-content-inner">${fieldsHtml}</div>`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

document.getElementById('access-code-button').addEventListener('click', () => {
    const participantName = document.getElementById('participant-name').value;
    if (!participantName) {
        alert('Please enter the participant name');
        return;
    }
    localStorage.setItem('participantName', participantName);
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

                // Automatically submit the data once the AI response is received
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
