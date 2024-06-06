window.addEventListener('DOMContentLoaded', (event) => {
    loadProductData();
});

function loadProductData() {
    fetch('wind_turbine_blade.xml')
        .then(response => response.text())
        .then(data => {
            console.log('XML Data:', data);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            console.log('Parsed XML Document:', xmlDoc);

            const product = xmlDoc.querySelector('product');
            if (product) {
                console.log('Product Found:', product);
                document.getElementById('passport-id').textContent = product.querySelector('passportID').textContent;
                document.getElementById('model-number').textContent = product.querySelector('modelNumber').textContent;
                document.getElementById('serial-number').textContent = product.querySelector('serialNumber').textContent;
                document.getElementById('passport-name').textContent = product.querySelector('name').textContent;
                document.getElementById('manufacture-date').textContent = product.querySelector('manufactureDate').textContent;
                document.getElementById('category').textContent = product.querySelector('category').textContent;
                document.getElementById('status').textContent = product.querySelector('status').textContent;
                document.getElementById('facility-id').textContent = product.querySelector('facilityID').textContent;
                document.getElementById('weight').textContent = product.querySelector('weight').textContent;
                document.getElementById('manufactured-by').textContent = product.querySelector('manufacturedBy').textContent;
                
                // Load other logo
                document.getElementById('other-logo').src = product.querySelector('otherLogo').textContent;

                // Material Composition
                const materials = product.querySelectorAll('materials material');
                const materialFields = [];
                materials.forEach(material => {
                    materialFields.push(`<div class="data-field"><strong>${material.querySelector('name').textContent}:</strong> <span>${material.querySelector('percentage').textContent}</span></div>`);
                });
                populateTab('material-composition', materialFields.join(''));

                // Performance
                populateTab('performance', generateDataFields(
                    'Capacity', product.querySelector('capacity').textContent, 
                    'Voltage', product.querySelector('voltage').textContent
                ));

                // Compliance
                const standards = product.querySelectorAll('standards standard');
                const standardFields = [];
                standards.forEach(standard => {
                    standardFields.push(`<div class="data-field"><strong>${standard.querySelector('name').textContent}:</strong> <span>${standard.querySelector('description').textContent}</span></div>`);
                });
                populateTab('compliance', standardFields.join(''));

                // Supply Chain
                const supplyChainSteps = product.querySelectorAll('supplyChainSteps step');
                const supplyChainFields = [];
                supplyChainSteps.forEach(step => {
                    supplyChainFields.push(`<div class="data-field"><strong>${step.querySelector('name').textContent}:</strong> <span>${step.querySelector('location').textContent}</span></div>`);
                });
                populateTab('supply-chain', supplyChainFields.join(''));

                // Circularity
                const recyclingInfo = product.querySelector('recyclingInfo');
                const recyclingFields = [];
                recyclingFields.push(`<div class="data-field"><strong>Method:</strong> <span>${recyclingInfo.querySelector('method').textContent}</span></div>`);
                recyclingFields.push(`<div class="data-field"><strong>Location:</strong> <span>${recyclingInfo.querySelector('location').textContent}</span></div>`);
                recyclingFields.push(`<div class="data-field"><strong>Instructions:</strong> <span>${recyclingInfo.querySelector('instructions').textContent}</span></div>`);
                populateTab('circularity', recyclingFields.join(''));

                // Carbon Footprint
                const emissions = product.querySelectorAll('carbonEmissions emission');
                const emissionFields = [];
                emissions.forEach(emission => {
                    emissionFields.push(`<div class="data-field"><strong>${emission.querySelector('phase').textContent}:</strong> <span>${emission.querySelector('value').textContent}</span></div>`);
                });
                populateTab('carbon-footprint', emissionFields.join(''));

                document.getElementById('product-passport').style.display = 'block';
                document.querySelector('.tab-button').click();

                // Store the entire XML content for later use in API request
                document.getElementById('xml-content').value = data;
            } else {
                console.error('Product not found in XML');
                alert('Product not found');
            }
        })
        .catch(error => {
            console.error('Error loading XML:', error);
        });
}

function generateDataFields(...fields) {
    const fieldsHtml = [];
    for (let i = 0; i < fields.length; i += 2) {
        fieldsHtml.push(`
            <div class="data-field">
                <strong>${fields[i]}:</strong> <span>${fields[i + 1]}</span>
            </div>
        `);
    }
    return fieldsHtml.join('');
}

function populateTab(tabId, fieldsHtml) {
    document.getElementById(tabId).innerHTML = `<div class="tab-content-inner">${fieldsHtml}</div>`;
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
    const apiKey = document.getElementById('access-code').value;
    if (!apiKey) {
        alert('Please enter the access code');
        return;
    }
    localStorage.setItem('apiKey', apiKey);
    document.getElementById('access-code-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
});

document.getElementById('search-button').addEventListener('click', () => {
    const apiKey = localStorage.getItem('apiKey');
    const searchTerm = document.getElementById('search-term').value;
    const xmlContent = document.getElementById('xml-content').value;
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    displayLoadingState(true);
    fetchFakeData(apiKey, searchTerm, xmlContent);
});

function fetchFakeData(apiKey, searchTerm, xmlContent) {
    const prompt = `Here is the digital product passport data: ${xmlContent}. Generate a realistic output answer for the following variable: ${searchTerm}. If the data does not exist, create realistic fake data that would fit with the existing parameters.`;
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'system', content: 'You are a digital product passport data assistant and should only respond with realistic data that would be found in a digital product passport. If you do not know the answer, generate a realistic sounding answer based on the available information. Do not include code or tags within the response, only the response value.' }, { role: 'user', content: prompt }],
            max_tokens: 200
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('OpenAI Response:', data);
        const responseContent = data.choices[0].message.content.trim();
        document.getElementById('api-response').textContent = responseContent;

        // Automatically submit the data once the AI response is received
        const dataToSave = {
            apiKey: apiKey,
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
}

function saveData(data) {
    fetch('/.netlify/functions/saveData', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(result => {
        if (response.ok) {
            alert('Data saved successfully');
        } else {
            alert('Error saving data: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving data');
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
