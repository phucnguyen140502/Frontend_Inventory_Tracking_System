let ProductAPI = `https://backend-inventory-tracking-system.onrender.com/products`;
let warehouseAPI = `https://backend-inventory-tracking-system.onrender.com/warehouse`;
let ImportAPI = `https://backend-inventory-tracking-system.onrender.com/goods_received_note`;
let supplierAPI = `https://backend-inventory-tracking-system.onrender.com/supplier`;


function start() {
    getProduct(function(data) {
        console.log(data.products);
        renderProduct(data.products);
    });

    const logoutBtn = document.querySelector(".logout-btn");

    // Handle logout
    logoutBtn.onclick = () => {
        localStorage.removeItem('authToken');
        alert("Logged out!");
        window.location.href = '/home.html'; // Redirect to login page
    }
}

function updateProduct(id, data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(ProductAPI + '/' + id, options)
        .then(function(response) {
            console.log("Update successful");
            console.log(response);
            console.log(data);
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}

// Hàm để lấy dữ liệu warehouse từ server dựa trên tên
function getWarehouseDataByName(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch("https://backend-inventory-tracking-system.onrender.com/warehouse/"+ name,
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

function getProduct(callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ProductAPI, 
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

function getGoodsReceivedNotesByProductId(productId, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ImportAPI + '?product_id=' + productId, 
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

function renderProduct(products){
    let details = document.querySelector('.details');
    let product_id = new URLSearchParams(window.location.search).get('product_id');
    console.log("Product ID:", product_id);
    console.log("Products:", products); // Kiểm tra dữ liệu products
    let product = products.filter(item => {
        return item.product_id === product_id
    });

    console.log("Filtered Product:", product); // Kiểm tra dữ liệu sau khi lọc

    if (product.length > 0) {
        // Nếu product có phần tử, gán giá trị cho details
        details.querySelector('.product_id').innerText = product[0].product_id;
        details.querySelector('.product_name').innerText = product[0].name;
        details.querySelector('.price').innerText = "$" + product[0].unit_price;
        details.querySelector('.category').innerText = product[0].category;
        details.querySelector('.quantity').innerText = product[0].inventory_quantity;
        details.querySelector('.created-at').innerText = product[0].created_at.toLocaleString().slice(0, 19).replace("T", " ");
        details.querySelector('.updated-at').innerText = product[0].updated_at.toLocaleString().slice(0, 19).replace("T", " ");
        details.querySelector('.warehouse_id').innerText = product[0].warehouse_id;
        
        findWarehouseById(product[0].warehouse_id, function(warehouse) {
            if (warehouse.length > 0) {
                console.log("Warehouse found:", warehouse[0]);
                // Thực hiện các hành động cần thiết với warehouse tại đây
                details.querySelector('.warehouse_name').innerText = warehouse[0].name;
                details.querySelector('.warehouse_location').innerText = warehouse[0].location;
                details.querySelector('.warehouse_capacity').innerText = warehouse[0].capacity;
            } else {
                console.log("Warehouse not found with ID:", product[0].warehouse_id);
            }
        });



        let updateProduct = document.querySelector('.update');
        updateProduct.onclick = function() {
            handleUpdateForm(product[0], details);
        }

        getGoodsReceivedNotesByProductId(product_id, function(data) {
            console.log("Goods Received Notes:", data.GoodsReceivedNotes);
    
            let suppliers = data.GoodsReceivedNotes.map(note => note.supplier_id);
            // Xóa các nhà cung cấp trùng lặp
            suppliers = [...new Set(suppliers)];
            console.log("Suppliers:", suppliers);
    
            getSuppliersByIds(suppliers, function(supplierDetails) {
                console.log("Supplier Details:", supplierDetails);
                renderSuppliers(supplierDetails);
            });
        });

    } else {
        console.log("Không tìm thấy sản phẩm với ID:", product_id);
    }
    
}

function findWarehouseById(warehouseId, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(warehouseAPI,
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
        .then(function(data) {
                // Nếu data là một mảng, lặp qua danh sách warehouse để tìm warehouse có warehouse_id tương ứng
            let foundWarehouse = data.warehouse.filter(warehouse => {
                return warehouse.warehouse_id === warehouseId;
            });
            // Gọi callback với kết quả tìm được
            callback(foundWarehouse);
            }
        )
        .catch(function(error) {
            console.log(error);
        });
}



function handleUpdateForm(product, row) {
    let updateButton = row.querySelector('.update');

    updateButton.onclick = function() {
        let priceInput = row.querySelector('input[name="input_unit_price"]');
        console.log(priceInput);
        let warehouseNameInput = row.querySelector('input[name="input_warehouse_name"]');
        console.log(warehouseNameInput);

        getWarehouseDataByName(warehouseNameInput.value, function(data) {
            if (data.error) {
                alert('Warehouse not found');
            } else{
                console.log(data.Warehouses[0].warehouse_id);
                let warehouseId = data.Warehouses[0].warehouse_id;

                let updatedProduct = {
                    unit_price: parseFloat(priceInput.value),
                    warehouse_id: warehouseId,
                    updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
                }

                updateProduct(product.product_id, updatedProduct, function() {
                    getProduct(function(data) {
                        renderProduct(data.products);
                    });
                });
            };
            });
        }
}

function getSuppliersByIds(supplierIds, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(supplierAPI, 
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
        .then(function(data) {
            // Lọc danh sách các nhà cung cấp dựa trên các IDs đã cho
            let filteredSuppliers = data.suppliers.filter(supplier => supplierIds.includes(supplier.supplier_id));
            // Gọi callback với danh sách các nhà cung cấp đã lọc
            callback(filteredSuppliers);
        })
        .catch(function(error) {
            console.log(error);
        });
}

function renderSuppliers(suppliers) {
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
        row.appendChild(nameCell);

        let phoneCell = document.createElement("td");
        phoneCell.textContent = supplier.phone_number;
        row.appendChild(phoneCell);

        let emailCell = document.createElement("td");
        emailCell.textContent = supplier.email;
        row.appendChild(emailCell);

        tableBody.appendChild(row);
    })
}

document.addEventListener('DOMContentLoaded', start);