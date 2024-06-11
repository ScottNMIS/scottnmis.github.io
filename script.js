document.addEventListener('DOMContentLoaded', () => {
    loadProductData();
    setupTabs();

    document.getElementById('zoom-in').addEventListener('click', () => {
        zoom.scaleBy(d3.select("#graph svg"), 1.2);
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        zoom.scaleBy(d3.select("#graph svg"), 0.8);
    });
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
        if (button.classList.contains('locked')) {
            button.disabled = true;
        } else {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
            });
        }
    });
}

function loadProductData() {
    fetch('DigitalProductPassport.json')
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('passport-id').textContent = data.metadata.passportIdentifier;
                document.getElementById('model-number').textContent = data.identification.type.manufacturerPartId;
                document.getElementById('serial-number').textContent = data.identification.serial[0].value;

                const otherLogoElement = "other_logo.png";  // Adjust as necessary
                if (otherLogoElement) {
                    document.getElementById('other-logo').src = otherLogoElement;
                }

                populateAllSection(data);
                populateGeneralSection(data);
                populateMaterialComposition(data);
                populatePerformance(data);
                populateCompliance(data);
                populateSupplyChain(data);
                populateCircularity(data);
                populateCarbonFootprint(data);
                populateCommercialSection(data);
                populateHandlingSection(data);
                populateAdditionalDataSection(data);
                populateOperationSection(data);
                populateSustainabilitySection(data);

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

function populateAllSection(data) {
    const allFields = [];
    allFields.push(`<div class="data-field"><strong>Passport ID:</strong> <span>${data.metadata.passportIdentifier}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Model Number:</strong> <span>${data.identification.type.manufacturerPartId}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Serial Number:</strong> <span>${data.identification.serial[0].value}</span></div>`);
    allFields.push(`<div class="data-field"><strong>General Performance Class:</strong> <span>${data.characteristics.generalPerformanceClass}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Physical State:</strong> <span>${data.characteristics.physicalState}</span></div>`);

    if (data.materials.materialComposition && data.materials.materialComposition.content) {
        data.materials.materialComposition.content.forEach(material => {
            allFields.push(`<div class="data-field"><strong>${material.id[0].name}:</strong> <span>${material.concentration}</span></div>`);
        });
    }

    allFields.push(`<div class="data-field"><strong>Volume:</strong> <span>${data.characteristics.physicalDimension.volume.value} ${data.characteristics.physicalDimension.volume.unit}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Compliance Standard:</strong> <span>${data.identification.classification[0].classificationStandard}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Manufacturer:</strong> <span>${data.operation.manufacturer.manufacturer}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Reparability Score:</strong> <span>${data.sustainability.reparabilityScore}</span></div>`);
    allFields.push(`<div class="data-field"><strong>Carbon Footprint:</strong> <span>${data.sustainability.productFootprint.carbon[0].value} ${data.sustainability.productFootprint.carbon[0].unit}</span></div>`);

    populateTab('all', allFields.join(''));
}

function populateGeneralSection(data) {
    const generalFields = [];
    generalFields.push(`<div class="data-field"><strong>General Performance Class:</strong> <span>${data.characteristics.generalPerformanceClass}</span></div>`);
    generalFields.push(`<div class="data-field"><strong>Physical State:</strong> <span>${data.characteristics.physicalState}</span></div>`);
    populateTab('general', generalFields.join(''));
}

function populateMaterialComposition(data) {
    const materials = data.materials.materialComposition.content;
    const materialFields = [];
    materials.forEach(material => {
        materialFields.push(`<div class="data-field"><strong>${material.id[0].name}:</strong> <span>${material.concentration}</span></div>`);
    });
    populateTab('material-composition', materialFields.join(''));
}

function populatePerformance(data) {
    const performanceFields = [];
    performanceFields.push(`<div class="data-field"><strong>Volume:</strong> <span>${data.characteristics.physicalDimension.volume.value} ${data.characteristics.physicalDimension.volume.unit}</span></div>`);
    populateTab('performance', performanceFields.join(''));
}

function populateCompliance(data) {
    const complianceFields = [];
    complianceFields.push(`<div class="data-field"><strong>Compliance Standard:</strong> <span>${data.identification.classification[0].classificationStandard}</span></div>`);
    populateTab('compliance', complianceFields.join(''));
}

function populateSupplyChain(data) {
    const supplyChainFields = [];
    supplyChainFields.push(`<div class="data-field"><strong>Manufacturer:</strong> <span>${data.operation.manufacturer.manufacturer}</span></div>`);
    populateTab('supply-chain', supplyChainFields.join(''));
}

function populateCircularity(data) {
    const circularityFields = [];
    circularityFields.push(`<div class="data-field"><strong>Reparability Score:</strong> <span>${data.sustainability.reparabilityScore}</span></div>`);
    populateTab('circularity', circularityFields.join(''));
}

function populateCarbonFootprint(data) {
    const carbonFootprintFields = [];
    carbonFootprintFields.push(`<div class="data-field"><strong>Carbon Footprint:</strong> <span>${data.sustainability.productFootprint.carbon[0].value} ${data.sustainability.productFootprint.carbon[0].unit}</span></div>`);
    populateTab('carbon-footprint', carbonFootprintFields.join(''));
}

function populateCommercialSection(data) {
    const commercialFields = [];
    commercialFields.push(`<div class="data-field"><strong>Placed On Market:</strong> <span>${data.commercial.placedOnMarket}</span></div>`);
    commercialFields.push(`<div class="data-field"><strong>Purpose:</strong> <span>${data.commercial.purpose.join(', ')}</span></div>`);
    populateTab('commercial', commercialFields.join(''));
}

function populateHandlingSection(data) {
    const handlingFields = [];
    handlingFields.push(`<div class="data-field"><strong>Producer ID:</strong> <span>${data.handling.content.producer[0].id}</span></div>`);
    handlingFields.push(`<div class="data-field"><strong>Spare Part ID:</strong> <span>${data.handling.content.sparePart[0].manufacturerPartId}</span></div>`);
    populateTab('handling', handlingFields.join(''));
}

function populateAdditionalDataSection(data) {
    const additionalFields = [];
    data.additionalData.forEach(item => {
        additionalFields.push(`<div class="data-field"><strong>${item.label}:</strong> <span>${item.data}</span></div>`);
    });
    populateTab('additional-data', additionalFields.join(''));
}

function populateOperationSection(data) {
    const operationFields = [];
    operationFields.push(`<div class="data-field"><strong>Import EORI:</strong> <span>${data.operation.import.content.eori}</span></div>`);
    operationFields.push(`<div class="data-field"><strong>Operation ID:</strong> <span>${data.operation.other.id}</span></div>`);
    operationFields.push(`<div class="data-field"><strong>Manufacturer Facility:</strong> <span>${data.operation.manufacturer.facility[0].facility}</span></div>`);
    operationFields.push(`<div class="data-field"><strong>Manufacturing Date:</strong> <span>${data.operation.manufacturer.manufacturingDate}</span></div>`);
    operationFields.push(`<div class="data-field"><strong>Manufacturer ID:</strong> <span>${data.operation.manufacturer.manufacturer}</span></div>`);
    populateTab('operation', operationFields.join(''));
}

function populateSustainabilitySection(data) {
    const sustainabilityFields = [];
    sustainabilityFields.push(`<div class="data-field"><strong>Reparability Score:</strong> <span>${data.sustainability.reparabilityScore}</span></div>`);
    sustainabilityFields.push(`<div class="data-field"><strong>Durability Score:</strong> <span>${data.sustainability.durabilityScore}</span></div>`);
    if (data.sustainability.productFootprint && data.sustainability.productFootprint.carbon) {
        sustainabilityFields.push(`<div class="data-field"><strong>Carbon Footprint:</strong> <span>${data.sustainability.productFootprint.carbon[0].value} ${data.sustainability.productFootprint.carbon[0].unit}</span></div>`);
    }
    populateTab('sustainability', sustainabilityFields.join(''));
}

function populateTab(tabId, fieldsHtml) {
    document.getElementById(tabId).innerHTML = `<div class="tab-content-inner">${fieldsHtml}</div>`;
}

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
