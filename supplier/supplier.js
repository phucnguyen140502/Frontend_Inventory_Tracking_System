let supplierAPI = `https://backend-inventory-tracking-system.onrender.com/supplier`;
let pageSize = 3;
function checkDiv(a, b){
    return a%b==0;
}

let current;
let totalPages= new Promise((resolve, reject) => {
    getSupplier(function(data) {
        if (data.error) {
            reject('Supplier not found.');
        } else if (checkDiv(data.suppliers.length, pageSize)) {
            resolve(Math.floor(data.suppliers.length / pageSize));
            } else {
            resolve(Math.floor(data.suppliers.length / pageSize) + 1);
            }
    });
});


function start() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Please, login")
        window.location.href = '/index.html'; // Redirect to login page
    }
    Promise.all([totalPages])
    .then(([totalPages]) => {
        paginateSupplier(1, function(data) {
            console.log(totalPages);
            renderSupplier(data.Suppliers);
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
}


// Define the function to fetch Supplier data from the server
function getSupplier(callback) {
    const authToken = localStorage.getItem('authToken');
    console.log("AuthToken "+authToken);
    fetch(supplierAPI, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        console.log(response);
        return response.json();
    })
    .then(callback)
    .catch(function(error) {
        console.log('Error fetching supplier data:', error);
    });
}

function createSupplier(data, callback) {
    const authToken = localStorage.getItem('authToken');
    console.log("AuthToken "+authToken);
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(supplierAPI, options)
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function deleteSupplier(id) {
    const authToken = localStorage.getItem('authToken');
    console.log("AuthToken "+authToken);
    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    fetch(supplierAPI + '/' + id, options)
        .then(function(response) {
            
                console.log('supplier deleted successfully.');
                getSupplier(function(data) {
                    renderSupplier(data.supplier);
                
            })
            
        })
        .catch(function(error) {
            console.log(error);
        });
}

function updateSupplier(id, data, callback) {
    const authToken = localStorage.getItem('authToken');
    console.log("AuthToken "+authToken);
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(supplierAPI + '/' + id, options)
        .then(function(response) {
            console.log("Update successful");
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function querySuppliers(name, callback) {
    fetch(supplierAPI + "/" + name)
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

// Cập nhật hàm paginatesupplier để lấy tổng số trang
function paginateSupplier(page, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(supplierAPI + `/paginate?page=${page}`,
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

// Hàm để tạo các button pagination
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
            current = page;
            return function() {
                paginateSupplier(page, function(data) {
                    renderSupplier(data.suppliers);
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

// Cập nhật hàm rendersupplier để gọi renderPagination
function renderSupplier(suppliers) {
    let tableBody = document.getElementById("supplier-table-body");

    // Clear the existing table body
    tableBody.innerHTML = "";

    // Loop through each supplier and create a table row for it
    suppliers.forEach(function(supplier) {
        let row = document.createElement("tr");

        let IDCell = document.createElement("td");
        IDCell.textContent = supplier.supplier_id;
        row.appendChild(IDCell);

        let nameCell = document.createElement("td");
        nameCell.textContent = supplier.name;
        let nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.name = "supplier-name";
        nameCell.appendChild(nameInput);
        row.appendChild(nameCell);

        let phoneCell = document.createElement("td");
        phoneCell.textContent = supplier.phone_number;
        let phoneInput = document.createElement("input");
        phoneInput.type = "text";
        phoneInput.pattern = "[0-9]{10}";
        phoneInput.name = "supplier-phone-number";
        phoneCell.appendChild(phoneInput);
        row.appendChild(phoneCell);

        let emailCell = document.createElement("td");
        emailCell.textContent = supplier.email;
        let emailInput = document.createElement("input");
        emailInput.type = "text";
        emailInput.name = "supplier-email";
        emailCell.appendChild(emailInput);
        row.appendChild(emailCell);

        let createdCell = document.createElement("td");
        let createdTime = new Date(supplier.created_at);
        let createdTimeString = createdTime.toISOString().slice(0, 19).replace("T", " ");
        createdCell.textContent = createdTimeString;
        row.appendChild(createdCell);

        let updatedCell = document.createElement("td");
        let updatedTime = new Date(supplier.updated_at);
        let updatedTimeString = updatedTime.toISOString().slice(0, 19).replace("T", " ");
        updatedCell.textContent = updatedTimeString;
        row.appendChild(updatedCell);

        let optionsCell = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        deleteButton.onclick = function() {
            deleteSupplier(supplier.supplier_id);
        };
        optionsCell.appendChild(deleteButton);

        let updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.classList.add("update");
        updateButton.onclick = function() {
            let nameInput = row.querySelector('input[name="supplier-name"]');
            let phoneInput = row.querySelector('input[name="supplier-phone-number"]');
            let emailInput = row.querySelector('input[name="supplier-email"]');

            let updatedSupplier = {
                name: nameInput.value,
                PhoneNumber: phoneInput.value,
                email: emailInput.value,
                updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
            };

            updateSupplier(supplier.supplier_id, updatedSupplier, function() {
                paginateSupplier(1, function(data) {
                    renderSupplier(data.Suppliers);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, 1);
                    })
                });
            });
        };
        optionsCell.appendChild(updateButton);

        row.appendChild(optionsCell);
        tableBody.appendChild(row);
    });

    let searchInput = document.querySelector('.search');
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.keyCode === 13) {
            let searchQuery = searchInput.value.trim();
            console.log(searchQuery);
            if(searchQuery == ''){
                paginateSupplier(1, function(data) {
                    renderSupplier(data.Suppliers);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, 1);
                    })
                    
                });
            } else {
                querySuppliers(searchQuery, function(data) {
                    renderSupplier(data.suppliers);
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
    let addButton = document.getElementById('add-supplier');

    addButton.onclick = function() {
        let name = document.querySelector('input[name="supplier-name"]').value;
        let PhoneNumber = document.querySelector('input[name="supplier-phone-number"]').value;
        let email = document.querySelector('input[name="supplier-email"]').value;
        let supplierForm = {
            name: name,
            PhoneNumber: PhoneNumber,
            email: email,
            created_at: new Date().toLocaleString().slice(0, 19).replace("T", " "), // Thêm giá trị thời gian hiện tại vào created_at
            updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
        };


        createSupplier(supplierForm, function() {
            paginateSupplier(1, function(data) {
                renderSupplier(data.Suppliers);
            });
        });

        console.log(supplierForm);
    };
}

function handleUpdateForm(supplier, row) {
    let updateButton = row.querySelector('.update');

    updateButton.onclick = function() {
        let nameInput = row.querySelector('input[name="supplier-name"]');
        let locationInput = row.querySelector('input[name="supplier-phone-number"]');
        let capacityInput = row.querySelector('input[name="supplier-email"]');

        let updatedSupplier = {
            name: nameInput.value,
            location: locationInput.value,
            capacity: parseInt(capacityInput.value),
            updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
        };

        updateSupplier(supplier.supplier_id, updatedSupplier, function() {
            paginateSupplier(1,function(data) {
                renderSupplier(data.Suppliers);
                rPromise.all([totalPages])
                .then(([totalPages]) => {
                    renderPagination(totalPages, 1);
                })
            });
        });
    };
}


document.addEventListener('DOMContentLoaded', start);
