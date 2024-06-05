let warehouseAPI = `https://backend-inventory-tracking-system.onrender.com/warehouse`;
let pageSize = 3;
let current;

function checkDiv(a, b){
    return a%b==0;
}

let totalPages= new Promise((resolve, reject) => {
    getWarehouse(function(data) {
        if (data.error) {
            reject('Warehouse not found.');
        } else if (checkDiv(data.warehouse.length, pageSize)) {
            resolve(Math.floor(data.warehouse.length / pageSize));
            } else {
            resolve(Math.floor(data.warehouse.length / pageSize) + 1);
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
        paginateWarehouse(1, function(data) {
            console.log(totalPages);
            renderWarehouse(data.warehouses);
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


// Define the function to fetch warehouse data from the server
function getWarehouse(callback) {
    const authToken = localStorage.getItem('authToken');
    console.log("AuthToken "+authToken);
    fetch(warehouseAPI, {
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
        console.log('Error fetching warehouse data:', error);
    });
}

function createWarehouse(data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(warehouseAPI, options)
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function deleteWarehouse(id) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    fetch(warehouseAPI + '/' + id, options)
        .then(function(response) {
            
                console.log('Warehouse deleted successfully.');
                getWarehouse(function(data) {
                    renderWarehouse(data.warehouse);
                
            })
            
        })
        .catch(function(error) {
            console.log(error);
        });
}

function updateWarehouse(id, data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(warehouseAPI + '/' + id, options)
        .then(function(response) {
            console.log("Update successful");
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

function queryWarehouses(name, callback) {
    const authToken = localStorage.getItem('authToken');
    console.log("AuthToken "+authToken);
    fetch(warehouseAPI + "/" + name, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

// Cập nhật hàm paginateWarehouse để lấy tổng số trang
function paginateWarehouse(page, callback) {
    const authToken = localStorage.getItem('authToken');

    fetch(warehouseAPI + `/paginate?page=${page}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
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
                paginateWarehouse(page, function(data) {
                    renderWarehouse(data.warehouses);
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

// Cập nhật hàm renderWarehouse để gọi renderPagination
function renderWarehouse(warehouses) {
    let tableBody = document.getElementById("warehouse-table-body");

    // Clear the existing table body
    tableBody.innerHTML = "";

    // Loop through each warehouse and create a table row for it
    warehouses.forEach(function(warehouse) {
        let row = document.createElement("tr");

        let IDCell = document.createElement("td");
        IDCell.textContent = warehouse.warehouse_id;
        row.appendChild(IDCell);

        let nameCell = document.createElement("td");
        nameCell.textContent = warehouse.name;
        let nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.name = "warehouse-name";
        nameCell.appendChild(nameInput);
        row.appendChild(nameCell);

        let locationCell = document.createElement("td");
        locationCell.textContent = warehouse.location;
        let locationInput = document.createElement("input");
        locationInput.type = "text";
        locationInput.name = "warehouse-location";
        locationCell.appendChild(locationInput);
        row.appendChild(locationCell);

        let capacityCell = document.createElement("td");
        capacityCell.textContent = warehouse.capacity;
        let capacityInput = document.createElement("input");
        capacityInput.type = "number";
        capacityInput.name = "warehouse-capacity";
        capacityCell.appendChild(capacityInput);
        row.appendChild(capacityCell);

        let createdCell = document.createElement("td");
        let createdTime = new Date(warehouse.created_at);
        let createdTimeString = createdTime.toISOString().slice(0, 19).replace("T", " ");
        createdCell.textContent = createdTimeString;
        row.appendChild(createdCell);

        let updatedCell = document.createElement("td");
        let updatedTime = new Date(warehouse.updated_at);
        let updatedTimeString = updatedTime.toISOString().slice(0, 19).replace("T", " ");
        updatedCell.textContent = updatedTimeString;
        row.appendChild(updatedCell);

        let optionsCell = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        deleteButton.onclick = function() {
            deleteWarehouse(warehouse.warehouse_id);
        };
        optionsCell.appendChild(deleteButton);

        let updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.classList.add("update");
        updateButton.onclick = function() {
            let nameInput = row.querySelector('input[name="warehouse-name"]');
            let locationInput = row.querySelector('input[name="warehouse-location"]');
            let capacityInput = row.querySelector('input[name="warehouse-capacity"]');

            let updatedWarehouse = {
                name: nameInput.value,
                location: locationInput.value,
                capacity: parseInt(capacityInput.value),
                updated_at: new Date().toLocaleString()
            };

            updateWarehouse(warehouse.warehouse_id, updatedWarehouse, function() {
                paginateWarehouse(1, function(data) {
                    renderWarehouse(data.warehouses);
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
                paginateWarehouse(1, function(data) {
                    renderWarehouse(data.warehouses);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, 1);
                    })
                    
                });
            } else {
                queryWarehouses(searchQuery, function(data) {
                    renderWarehouse(data.Warehouses);
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
    let addButton = document.getElementById('add-warehouse');

    addButton.onclick = function() {
        let name = document.querySelector('input[name="warehouse-name"]').value;
        let location = document.querySelector('input[name="warehouse-location"]').value;
        let capacity = parseInt(document.querySelector('input[name="warehouse-capacity"]').value);
        let warehouseForm = {
            name: name,
            location: location,
            capacity: capacity,
            created_at: new Date().toLocaleString().slice(0, 19).replace("T", " "), // Thêm giá trị thời gian hiện tại vào created_at
            updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
        };

        createWarehouse(warehouseForm, function() {
            paginateWarehouse(1,function(data) {
                renderWarehouse(data.warehouses);
            });
        });

        console.log(warehouseForm);
    };
}

function handleUpdateForm(warehouse, row) {
    let updateButton = row.querySelector('.update');

    updateButton.onclick = function() {
        let nameInput = row.querySelector('input[name="warehouse-name"]');
        let locationInput = row.querySelector('input[name="warehouse-location"]');
        let capacityInput = row.querySelector('input[name="warehouse-capacity"]');

        let updatedWarehouse = {
            name: nameInput.value,
            location: locationInput.value,
            capacity: parseInt(capacityInput.value),
            updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
        };

        updateWarehouse(warehouse.warehouse_id, updatedWarehouse, function() {
            paginateWarehouse(1,function(data) {
                renderWarehouse(data.warehouses);
                rPromise.all([totalPages])
                .then(([totalPages]) => {
                    renderPagination(totalPages, 1);
                })
            });
        });
    };
}


document.addEventListener('DOMContentLoaded', start);
