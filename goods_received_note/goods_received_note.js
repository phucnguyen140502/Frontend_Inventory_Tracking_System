let ImportAPI = `https://backend-inventory-tracking-system.onrender.com/goods_received_note`;
let pageSize = 3;

function checkDiv(a, b){
    return a%b==0;
}

let totalPages= new Promise((resolve, reject) => {
    getImport(function(data) {
        if (data.error) {
            reject('Supplier not found.');
        } else if (checkDiv(data.GoodsReceivedNotes.length, pageSize)) {
            resolve(Math.floor(data.GoodsReceivedNotes.length / pageSize));
            } else {
            resolve(Math.floor(data.GoodsReceivedNotes.length / pageSize) + 1);
            }
    });
});

// Define the start function
function start() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Please, login")
        window.location.href = '/index.html'; // Redirect to login page
    }
    Promise.all([totalPages])
    .then(([totalPages]) => {
        paginateImport(1, function(data) {
            console.log(totalPages);
            renderImport(data.GoodsReceivedNotes);
            renderPagination(totalPages, 1);
        });
        handleCreateForm();
    })

    const logoutBtn = document.querySelector(".logout-btn");

    // Handle logout
    logoutBtn.onclick = () => {
        localStorage.removeItem('authToken');
        alert("Logged out!");
        window.location.href = '/index.html'; // Redirect to login page
    }

    fetchProductNames();
    fetchSupplierNames();
}

// Define the function to fetch Import data from the server
function getImport(callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ImportAPI,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function createImport(data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(ImportAPI, options)
        .then(function(response) {
            console.log("create successful");
            console.log(data);
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function paginateImport(page, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ImportAPI + `/import/paginate?page=${page}`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

let availableKeywordsSupplier = [];
function fetchSupplierNames() {
    const authToken = localStorage.getItem('authToken');
    fetch('https://backend-inventory-tracking-system.onrender.com/supplier/supplier-name',
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(response => response.json())
        .then(data => {
            availableKeywordsSupplier = data.names;
            console.log(availableKeywordsSupplier);
            const inputBox = document.getElementById('supplier-name');
            const resultsBox = document.getElementById('results-box-supplier');

            inputBox.addEventListener('input', () => {
                let filteredKeywords = [];
                const query = inputBox.value.toLowerCase();
                if(query.length){
                    filteredKeywords = availableKeywordsSupplier.filter(keyword => keyword.toLowerCase().includes(query));
                }
                console.log(filteredKeywords);
                displayResultsSupplier(filteredKeywords, resultsBox);

                if (!filteredKeywords.length) {
                    resultsBox.innerHTML = '';
                }
            });
        })
        .catch(error => console.log(error));
}

function displayResultsSupplier(results, resultsBox) {
    console.log(results);
    if (results.length) {
        const content = results.map(item => `<li onclick="selectInputSupplier('${item}')">${item}</li>`).join('');
        resultsBox.innerHTML = `<ul>${content}</ul>`;
    }
}

function selectInputSupplier(value) {
    const inputBox = document.getElementById('supplier-name');
    inputBox.value = value;
    document.getElementById('results-box-supplier').innerHTML = '';
}


let availableKeywordsProduct = [];
function fetchProductNames() {
    const authToken = localStorage.getItem('authToken');
    fetch('https://backend-inventory-tracking-system.onrender.com/products/product-name',
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(response => response.json())
        .then(data => {
            availableKeywordsProduct = data.names;
            console.log(availableKeywordsProduct);
            const inputBox = document.getElementById('product-name');
            const resultsBox = document.getElementById('results-box-product');

            inputBox.addEventListener('input', () => {
                let filteredKeywords = [];
                const query = inputBox.value.toLowerCase();
                if(query.length){
                    filteredKeywords = availableKeywordsProduct.filter(keyword => keyword.toLowerCase().includes(query));
                }
                console.log(filteredKeywords);
                displayResultsProduct(filteredKeywords, resultsBox);

                if (!filteredKeywords.length) {
                    resultsBox.innerHTML = '';
                }
            });
        })
        .catch(error => console.log(error));
}

function displayResultsProduct(results, resultsBox) {
    console.log(results);
    if (results.length) {
        const content = results.map(item => `<li onclick="selectInputProduct('${item}')">${item}</li>`).join('');
        resultsBox.innerHTML = `<ul>${content}</ul>`;
    }
}

function selectInputProduct(value) {
    const inputBox = document.getElementById('product-name');
    inputBox.value = value;
    document.getElementById('results-box-product').innerHTML = '';
}

function renderPagination(totalPages, currentPage) {
    let paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        let button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-button');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.onclick = (function(page) {
            console.log(page)
            return function() {
                paginateImport(page, function(data) {
                    renderImport(data.GoodsReceivedNotes);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, current);
                    })
                });
            };
        })(i);
        paginationContainer.appendChild(button);
    }
}



// Hàm để lấy dữ liệu warehouse từ server dựa trên tên
function getProductDataByName(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch("https://backend-inventory-tracking-system.onrender.com/products/"+ name, 
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

// Hàm để lấy dữ liệu warehouse từ server dựa trên tên
function getSupplierDataByName(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch("https://backend-inventory-tracking-system.onrender.com/supplier/"+ name,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}


function queryImports(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ImportAPI + "/import/" + name,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function deleteImport(id) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    fetch(ImportAPI + '/' + id, options)
        .then(function(response) {
            
                console.log('Import deleted successfully.');
                getImport(function(data) {
                    renderImport(data.GoodsReceivedNotes);
                
            })
            
        })
        .catch(function(error) {
            console.log(error);
        });

        
}

function updateImport(id, data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(ImportAPI + '/' + id, options)
        .then(function(response) {
            console.log(id);
            console.log(data);
            console.log("Update successful");
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

// Define the function to render Import data on the web page
function renderImport(GoodsReceivedNotes) {
    let tableBody = document.getElementById("Import-table-body");

    // Clear the existing table body
    tableBody.innerHTML = "";
    

    // Loop through each Import and create a table row for it
    GoodsReceivedNotes.forEach(function(GoodsReceivedNote) {
        let row = document.createElement("tr");

        let IDCell = document.createElement("td");
        IDCell.textContent = GoodsReceivedNote.goods_received_note_id;
        row.appendChild(IDCell);

        let nameCell = document.createElement("td");
        nameCell.textContent = GoodsReceivedNote.name + " " + GoodsReceivedNote.amounts.toString();
        row.appendChild(nameCell);
        
        let amountCell = document.createElement("td");
        amountCell.textContent = GoodsReceivedNote.amounts;
        let amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.name = "total-amount";
        amountCell.appendChild(amountInput);
        row.appendChild(amountCell);

        let priceCell = document.createElement("td");
        priceCell.textContent = "$" + GoodsReceivedNote.price;
        row.appendChild(priceCell);

        let createdCell = document.createElement("td");
        let createdTime = new Date(GoodsReceivedNote.created_at);
        let createdTimeString = createdTime.toISOString().slice(0, 19).replace("T", " ");
        createdCell.textContent = createdTimeString;
        row.appendChild(createdCell);

        let updatedCell = document.createElement("td");
        let updatedTime = new Date(GoodsReceivedNote.updated_at);
        let updatedTimeString = updatedTime.toISOString().slice(0, 19).replace("T", " ");
        updatedCell.textContent = updatedTimeString;
        row.appendChild(updatedCell);

        let optionsCell = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        deleteButton.onclick = function() {
            deleteImport(GoodsReceivedNote.goods_received_note_id);
        };
        optionsCell.appendChild(deleteButton);

        let updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.classList.add("update");
        updateButton.onclick = function() {
            let amountInput = row.querySelector('input[name="total-amount"]');

            let updatedImport = {
                amounts: parseInt(amountInput.value),
                updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
            };

            updateImport(GoodsReceivedNote.goods_received_note_id, updatedImport, function() {
                paginateImport(1, function(data) {
                    renderImport(data.GoodsReceivedNotes);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, 1);
                    })
                });
            });
        };
        optionsCell.appendChild(updateButton);

        row.appendChild(optionsCell);

        handleUpdateForm(GoodsReceivedNote, row);
        // Append the row to the table body
        tableBody.appendChild(row);
    })

    let searchInput = document.querySelector('.search');
        searchInput.addEventListener('keyup', function(event) {
            if (event.keyCode === 13) {
                // 13 là mã phím cho phím Enter
                let searchQuery = searchInput.value.trim(); // Lấy giá trị từ ô tìm kiếm và loại bỏ khoảng trắng đầu cuối
                if(searchQuery == ''){
                    paginateImport(1, function(data) {
                        renderImport(data.GoodsReceivedNotes);
                        Promise.all([totalPages])
                        .then(([totalPages]) => {
                            renderPagination(totalPages, 1);
                        })
                        
                    });
                } else {
                    queryImports(searchQuery, function(data) {
                        renderImport(data.GoodsReceivedNotes);
                        Promise.all([totalPages])
                        .then(([totalPages]) => {
                            renderPagination(totalPages, 1);
                        })
                    });
                }
            }
        });
}

function handleCreateForm() {
    let addButton = document.getElementById('add-Import');
    addButton.addEventListener('click', function() {
        event.preventDefault(); // Prevent the default form submission
        console.log('aaa');
        let supplierName = document.querySelector('input[name="supplier-name"]').value;
        let productName = document.querySelector('input[name="product-name"]').value;
        let amounts = parseInt(document.querySelector('input[name="total-amount"]').value);

        console.log(productName);
        let supplierIDPromise = new Promise((resolve, reject) => {
            getSupplierDataByName(supplierName, function(data) {
                if (data.error) {
                    reject('Supplier not found.');
                } else {
                    resolve(data.suppliers[0].supplier_id);
                }
            });
        });

        let productIDPromise = new Promise((resolve, reject) => {
            getProductDataByName(productName, function(data) {
                if (data.error) {
                    reject('Product not found.');
                } else {
                    resolve(data.Product[0].product_id);
                }
            });
        });

        Promise.all([supplierIDPromise, productIDPromise])
            .then(([supplierID, productID]) => {
                let ImportForm = {
                    supplier_id: supplierID,
                    product_id: productID,
                    amounts: amounts,
                    created_at: new Date().toLocaleString().slice(0, 19).replace("T", " "),
                    updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
                };

                console.log("supplier id: " + supplierID);
                console.log("product id: " + productID);

                createImport(ImportForm, function() {
                    paginateImport(1,function(data) {
                        console.log(data);
                        renderImport(data.GoodsReceivedNotes);
                    });
                });

                console.log(ImportForm);
            })
            .catch(error => {
                alert(error);
            });
    });
}


function handleUpdateForm(Import, row) {
    let updateButton = row.querySelector('.update');

    updateButton.onclick = function() {
        event.preventDefault(); // Prevent the default form submission
        
        let amountInput = row.querySelector('input[name="total-amount"]');
        
        let updatedImport = {
            amounts: parseInt(amountInput.value),
            updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
        };

        updateImport(Import.goods_received_note_id, updatedImport, function() {
            paginateImport(1, function(data) {
                renderImport(data.GoodsReceivedNotes);
                Promise.all([totalPages])
                .then(([totalPages]) => {
                    renderPagination(totalPages, 1);
                })
            });
        });
    };
}

document.addEventListener('DOMContentLoaded', start);
