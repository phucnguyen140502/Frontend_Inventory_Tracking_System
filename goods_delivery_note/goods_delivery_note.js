let ExportAPI = `https://backend-inventory-tracking-system.onrender.com/goods_delivery_note`;
let pageSize = 3;

function checkDiv(a, b){
    return a%b==0;
}

let totalPages= new Promise((resolve, reject) => {
    getExport(function(data) {
        if (data.error) {
            reject('Supplier not found.');
        } else if (checkDiv(data.GoodsDeliveredNotes.length, pageSize)) {
            resolve(Math.floor(data.GoodsDeliveredNotes.length / pageSize));
            } else {
            resolve(Math.floor(data.GoodsDeliveredNotes.length / pageSize) + 1);
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
        paginateExport(1, function(data) {
            console.log(totalPages);
            renderExport(data.GoodsDeliveredNotes);
            renderPagination(totalPages, 1);
        });
        handleCreateForm();
    })

    const logoutBtn = document.querySelector(".logout-btn");

    // Handle logout
    logoutBtn.onclick = () => {
        localStorage.removeItem('authToken');
        alert("Logged out!");
        window.location.href = '/home.html'; // Redirect to login page
    }
    fetchProductNames();

}

// Define the function to fetch Export data from the server
function getExport(callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ExportAPI,
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

function createExport(data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(ExportAPI, options)
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

function deleteExport(id) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    fetch(ExportAPI + '/' + id, options)
        .then(function(response) {
            
                console.log('Export deleted successfully.');
                getExport(function(data) {
                    renderExport(data.GoodsDeliveredNotes);
                
            })
            
        })
        .catch(function(error) {
            console.log(error);
        });
}

function updateExport(id, data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(ExportAPI + '/' + id, options)
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

function queryExports(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ExportAPI + "/export/" + name, 
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

function paginateExport(page, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ExportAPI + `/export/paginate?page=${page}`,
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
                paginateExport(page, function(data) {
                    console.log(data)
                    renderExport(data.GoodsDeliveredNotes);
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

// Define the function to render Export data on the web page
function renderExport(GoodsDeliveredNotes) {
    let tableBody = document.getElementById("Export-table-body");

    // Clear the existing table body
    tableBody.innerHTML = "";
    

    // Loop through each Export and create a table row for it
    GoodsDeliveredNotes.forEach(function(GoodsDeliveredNote) {
        let row = document.createElement("tr");

        let IDCell = document.createElement("td");
        IDCell.textContent = GoodsDeliveredNote.goods_delivery_note_id;
        row.appendChild(IDCell);

        let nameCell = document.createElement("td");
        nameCell.textContent = GoodsDeliveredNote.name + " " + GoodsDeliveredNote.amounts.toString();
        row.appendChild(nameCell);
        
        let amountCell = document.createElement("td");
        amountCell.textContent = GoodsDeliveredNote.amounts;
        let amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.name = "total-amount";
        amountCell.appendChild(amountInput);
        row.appendChild(amountCell);

        let priceCell = document.createElement("td");
        priceCell.textContent = "$" + GoodsDeliveredNote.price;
        row.appendChild(priceCell);

        let createdCell = document.createElement("td");
        let createdTime = new Date(GoodsDeliveredNote.created_at);
        let createdTimeString = createdTime.toISOString().slice(0, 19).replace("T", " ");
        createdCell.textContent = createdTimeString;
        row.appendChild(createdCell);

        let updatedCell = document.createElement("td");
        let updatedTime = new Date(GoodsDeliveredNote.updated_at);
        let updatedTimeString = updatedTime.toISOString().slice(0, 19).replace("T", " ");
        updatedCell.textContent = updatedTimeString;
        row.appendChild(updatedCell);

        let optionsCell = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        deleteButton.onclick = function() {
            deleteExport(GoodsDeliveredNote.goods_delivery_note_id);
        };
        optionsCell.appendChild(deleteButton);

        let updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.classList.add("update");
        updateButton.onclick = function() {
            let amountInput = row.querySelector('input[name="total-amount"]');

            let updatedExport = {
                amounts: parseInt(amountInput.value),
                updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
            };
            updateExport(GoodsDeliveredNote.goods_delivery_note_id, updatedExport, function() {
                paginateExport(1, function(data) {
                    renderExport(data.GoodsDeliveredNotes);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, 1);
                    })
                });
            });
        };
        optionsCell.appendChild(updateButton);

        row.appendChild(optionsCell);

        handleUpdateForm(GoodsDeliveredNote, row);
        // Append the row to the table body
        tableBody.appendChild(row);
    });

    let searchInput = document.querySelector('.search');
    searchInput.addEventListener('keyup', function(event) {
        if (event.keyCode === 13) {
            // 13 là mã phím cho phím Enter
            let searchQuery = searchInput.value.trim(); // Lấy giá trị từ ô tìm kiếm và loại bỏ khoảng trắng đầu cuối
            if(searchQuery == ''){
                paginateExport(1, function(data) {
                    renderExport(data.GoodsDeliveredNotes);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, 1);
                    })
                    
                });
            } else {
                queryExports(searchQuery, function(data) {
                    renderExport(data.GoodsDeliveryNotes);
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
    let addButton = document.getElementById('add-Export');

    addButton.addEventListener('click', function() {
         event.preventDefault(); // Prevent the default form submission
        let productName = document.querySelector('input[name="product-name"]').value;
        let amounts = parseInt(document.querySelector('input[name="total-amount"]').value);

        getProductDataByName(productName, function(data) {
            if (data.error) {
                alert('Product not found');
            } else{
                let productID = data.Product[0].product_id;

                console.log(productID);

                let ExportForm = {
                    product_id: productID,
                    amounts: amounts,
                    created_at: new Date().toLocaleString().slice(0, 19).replace("T", " "),
                    updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
                }

                
                createExport(ExportForm, function() {
                    paginateExport(1,function(data) {
                        console.log(data);
                        renderExport(data.GoodsDeliveredNotes);
                    });
                });
                console.log(ExportForm);
            }
        })
    });
}

function handleUpdateForm(Export, row) {
    let updateButton = row.querySelector('.update');

    updateButton.onclick = function() {
        event.preventDefault(); // Prevent the default form submission
        let amountInput = row.querySelector('input[name="total-amount"]');
        
        let updatedExport = {
            amounts: parseInt(amountInput.value),
            updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
        };

        updateExport(Export.goods_delivery_note_id, updatedExport, function() {
            paginateExport(1, function(data) {
                console.log(data);
                renderExport(data.GoodsDeliveredNotes);
                Promise.all([totalPages])
                .then(([totalPages]) => {
                    renderPagination(totalPages, 1);
                })
            });
        });
    };
}

document.addEventListener('DOMContentLoaded', start);
