import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut} from 'https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js';

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-analytics.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCx1hNcmq6MGPUNhhFGhHgRcQorhvnxoFc",
    authDomain: "hello-again-87123.firebaseapp.com",
    projectId: "hello-again-87123",
    storageBucket: "hello-again-87123.appspot.com",
    messagingSenderId: "547973375107",
    appId: "1:547973375107:web:1f3418c0c68c876d82a7b6",
    measurementId: "G-Y8VHF18DLB",
    databaseURL: "https://hello-again-87123-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "gs://hello-again-87123.appspot.com"
};

//-------------------------------------- Initialize Firebase ---------------------------------------
const app = initializeApp(firebaseConfig);
const storage = getStorage();

const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storageRef = sref(storage);

onAuthStateChanged(auth, user => {
    if (user) {
        if(user.uid != "bYpgltMnJBQIFUimHBSbfJWOc0V2"){
            const auth = getAuth();
        signOut(auth).then(() => {
        // Sign-out successful.
            alert("You do not have the permission to view this page.")
            location.replace("index.html");
        }).catch((error) => {
        // An error happened.
        });
        }


        console.log('Logged in');

    } else {
        if(document.querySelector("#loginForm")){
            //do nothing
        }else{
            location.replace("index.html");
        }

    }
});

// --------------------------------------- Log in form ---------------------------------------
const loginForm = document.querySelector("#loginForm");
if(loginForm != null){
    loginForm.addEventListener("submit", (e) =>{
        e.preventDefault();
        //get user input
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        // console.log(email, password);
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            location.replace("adminPage1.html");
            if(user.uid != "bYpgltMnJBQIFUimHBSbfJWOc0V2"){
                const auth = getAuth();
                signOut(auth).then(() => {
                // Sign-out successful.
                    alert("You do not have the permission to view this page.")
                    location.replace("index.html");
                }).catch((error) => {
                // An error happened.
                });
                }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        })
    })
}

const adminPage1 = document.querySelector("#mainAdminPageContainer");
if(adminPage1 != null){

    const dbRef = ref(getDatabase());
    var pendingShipOutTable = document.getElementById("adminPage_pendingShipoutTable");
    var sendForShippingTable = document.getElementById("adminPage_sendForShippingTable");
    var pastOrdersTable = document.getElementById("adminPage_pastOrdersTable");
    var itemPricesTable = document.getElementById("itemPrices");

    get(child(dbRef, "confirmedPaymentReceipt/")).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            var tableBody = document.createElement("tbody");
            pendingShipOutTable.appendChild(tableBody);

            for(const date in data){
                for(const receiptuuid in data[date]){
                    const tableRow = document.createElement("tr");
                    tableBody.appendChild(tableRow);
                    const customerName = data[date][receiptuuid].customerName;
                    const customeruuid = data[date][receiptuuid].customeruuid;
                    const needBy = data[date][receiptuuid].need_by;
                    const dateOfPayment = data[date][receiptuuid].dateOfSubmission;
                    const timeOfPayment = data[date][receiptuuid].timeOfSubmission;
                    const deliveryLocation = data[date][receiptuuid].deliveryLocation;
                    const piadForItems = JSON.parse(data[date][receiptuuid].paidForItems)
                    const itemDetails = JSON.parse(data[date][receiptuuid].itemDetails);   
                    const marketingPermission = data[date][receiptuuid].marketingPermission;
                    const paidAmount = data[date][receiptuuid].paymentAmount;
                    const phoneNumber = data[date][receiptuuid].phoneNumber;
                    const returningCustomer = data[date][receiptuuid].returningCustomer;
                    
                    const list_paymentDetails = [customerName, dateOfPayment, needBy, timeOfPayment
                                                ,deliveryLocation, itemDetails, marketingPermission
                                                ,paidAmount, phoneNumber, returningCustomer]

                    list_paymentDetails.forEach((item) => {
                        const tableData = document.createElement("td");
                        if(item != itemDetails){
                            tableData.innerHTML = item;
                            tableRow.appendChild(tableData);
                        }else{
                            const detailsButton = document.createElement("button");
                            // console.log(itemDetails)
                            function detailsButtonOnclick(){
                                const store_moreDetails = {
                                    "customeruuid" : customeruuid,
                                    "itemID" : itemDetails,
                                    "dateOfPayment" : dateOfPayment
                                };
                                localStorage.setItem("helloAgainAdminTemp_moreDetails", JSON.stringify(store_moreDetails));
                                location.replace("orderDetails.html");

                            }
                            tableData.appendChild(detailsButton);
                            detailsButton.innerHTML = "More details";
                            detailsButton.onclick = detailsButtonOnclick;
                            tableRow.appendChild(tableData);
                        }
                    });

                    function onclick_seePaymentProof(){
                        return new Promise((resolve, reject) => {
                            const storage = getStorage();
                            getDownloadURL(sref(storage, "confirmedPaymentReceipt/" + dateOfPayment + "/" + receiptuuid))
                            .then((url) => {
                                const seePaymentProof = document.createElement("a");
                                seePaymentProof.setAttribute("href", url);
                                seePaymentProof.setAttribute("download", "polaroidImg");
                                seePaymentProof.innerHTML = "<button>Proof of Payment</button>";

                                const seePaymentProofTD = document.createElement("td");
                                seePaymentProofTD.appendChild(seePaymentProof);
                                tableRow.appendChild(seePaymentProofTD);
                                sendForShippingButtonCreation();
                                resolve();
                            }).catch((error) => {
                                reject();
                                // Handle any errors
                            });

                            
                        });
                    }


                    // var list_justItemTypes = [];
                    // for(var i =0; i<itemDetails.length; i++){

                    // }
                    // for(const item in itemDetails){
                    //     list_justItemTypes.push(itemDetails[item].item_type);
                    // }

                    function moveToShippingPhase(){
                        const dateTime = new Date().toLocaleString().replaceAll("/","_").replaceAll(" ", "").split(",")
                        const date = dateTime[0];
                        const time = dateTime[1];

                        const db = getDatabase();
                        set(ref(db, "toShipOut/" + date + "/"+ receiptuuid), {
                            customerName : customerName,
                            orderConfirmedOn: date,
                            deliveryLocation: deliveryLocation,
                            items: JSON.stringify(itemDetails),
                            phoneNumber : phoneNumber,
                            marketingPermission: marketingPermission
                        }).then(() => {
                            set(ref(db, "confirmedPaymentReceipt/" + dateOfPayment + "/" + receiptuuid), null).then(() => {
                                location.reload();
                            });
                        });

                        
                        

                    }

                    // Button to confirm that details are correct
                    function sendForShippingButtonCreation(){
                        const confirmButton = document.createElement("button");
                        confirmButton.innerHTML = "Confirm";
                        confirmButton.onclick = moveToShippingPhase;
                        var confirmButtonTD = document.createElement("td");
                        confirmButtonTD.appendChild(confirmButton);
                        tableRow.appendChild(confirmButtonTD);
                    }

                    async function createPayment_confirm(){
                        await onclick_seePaymentProof();
                        
                    }
                    
                    createPayment_confirm();
                    tableBody.appendChild(tableRow);
                }

            }
        }
    });
    get(child(dbRef, "toShipOut/")).then((snapshot) => {
        if (snapshot.exists()) {
            const shippingData = snapshot.val();
            for(const date in shippingData){
                for(const shipment in shippingData[date]){
                    const tableBody = document.createElement("tbody");
                    sendForShippingTable.appendChild(tableBody);
                    const tableRow = document.createElement("tr");
                    tableBody.appendChild(tableRow)
                
                    const customerName = shippingData[date][shipment].customerName;
                    const deliveryLocation = shippingData[date][shipment].deliveryLocation;
                    const items = JSON.parse(shippingData[date][shipment].items);
                    const marketingPermission = shippingData[date][shipment].marketingPermission;
                    const orderConfirmedOn = shippingData[date][shipment].orderConfirmedOn;
                    const phoneNumber = shippingData[date][shipment].phoneNumber;

                    const list_shippingDetails = [customerName, orderConfirmedOn, deliveryLocation, items, phoneNumber, marketingPermission];
                    list_shippingDetails.forEach((detail) => {
                        const tableData = document.createElement("td");
                        if(detail != items){
                            tableData.innerHTML = detail;
                            tableRow.appendChild(tableData);
                        }else{
                            for(const receiptNumber in detail){
                                for(const itemPurchased in detail[receiptNumber]){
                                    tableData.innerHTML += detail[receiptNumber][itemPurchased].itemType;
                                    tableData.innerHTML += ", "
                                }
                                
                            }
                            tableRow.appendChild(tableData);
                        }
                        
                    });

                    // Create complete orders button
                    function completeOrderFunction(){
                        const dateTimeCompletion = new Date().toLocaleString().replaceAll("/","_").replaceAll(" ", "").split(",")
                        const dateOfCompletion= dateTimeCompletion[0];

                        const db = getDatabase();
                        set(ref(db, "completedOrders/" + shipment), {
                            customerName : customerName,
                            orderCompletedOn: dateOfCompletion,
                            items: JSON.stringify(items),
                            phoneNumber : phoneNumber,
                            marketingPermission: marketingPermission
                        }).then(() => {
                            // const db = getDatabase;
                            set(ref(db, "toShipOut/" + date + "/" + shipment), null).then(() => {
                                const storage = getStorage();
                                const deleteRef = sref(storage, 'confirmedPaymentReceipt/' + date + "/" + shipment)
                                deleteObject(deleteRef).then(() => {
                                    location.reload();
                                })
                            })
                        })
                    }

                    const completeOrderButton = document.createElement("button");
                    completeOrderButton.innerHTML = "Order Completed";
                    completeOrderButton.onclick = completeOrderFunction;    
                    const completeOrderButtonTD = document.createElement("td");
                    completeOrderButtonTD.appendChild(completeOrderButton);
                    tableRow.appendChild(completeOrderButtonTD);
                    


                }
                
            }
        }else{
            console.log("No data available (Shipping on the way section)");
        }
    });

    get(child(dbRef, "completedOrders/")).then((snapshot) => {
        if(snapshot.exists()){
            const completedOrdersData = snapshot.val();

            const tableBody = document.createElement("tbody");
            pastOrdersTable.appendChild(tableBody);

            for(const completedOrders in completedOrdersData){
                const tableRow = document.createElement("tr");
                tableBody.appendChild(tableRow);
                const customerNameCompleted = completedOrdersData[completedOrders].customerName;
                const itemsCompleted = JSON.parse(completedOrdersData[completedOrders].items);
                const marketingPermissionCompleted = completedOrdersData[completedOrders].marketingPermission;
                const orderCompletedOn = completedOrdersData[completedOrders].orderCompletedOn;
                const phoneNumberCompleted = completedOrdersData[completedOrders].phoneNumber;
                const list_completedOrderProperties = [customerNameCompleted, orderCompletedOn, itemsCompleted, phoneNumberCompleted, marketingPermissionCompleted];

                

                list_completedOrderProperties.forEach((property) => {
                    const tableData = document.createElement("td");
                    if(property!=itemsCompleted){
                        tableData.innerHTML = property;
                    }else{
                        for(const receiptNumber in property){
                            for(const itemPurchased in property[receiptNumber]){
                                tableData.innerHTML += property[receiptNumber][itemPurchased].itemType;
                                tableData.innerHTML += ", "
                            }
                            
                        }
                    }
                    tableRow.appendChild(tableData);
                });
            }
        }else{
            console.log("No orders were completed yet...");
        }
    });
    //itemPricesTable

    get(child(dbRef, "prices/")).then((snapshot) => {
        if(snapshot.exists()){
            const priceData = snapshot.val();
            const tableBody = document.createElement("tbody");
            itemPricesTable.appendChild(tableBody);
            const tableRow = document.createElement("tr");
            tableBody.appendChild(tableRow);

            const classicPrice = priceData.classic;
            const timelessPrice = priceData.timeless;
            const alwaysPrice = priceData.always;

            const list_prices = [classicPrice, timelessPrice, alwaysPrice];
            
            list_prices.forEach((price) => {
                const tableData = document.createElement("td");
                tableData.innerHTML = price;
                tableRow.appendChild(tableData);
            });

        }else{
            console.log("error");
        }
    });


    // program to check if a number is a float or integer value

        function checkNumber(x) {

            // check if the passed value is a number
            if(typeof x == 'number' && !isNaN(x)){
            
                // check if it is integer
                if (Number.isInteger(x)) {
                    return "integer";
                }
                else {
                    return "float";
                }
            
            } else {
                return null;
            }
        }

        const submitButtons = document.getElementsByClassName("priceChangeButton");
        var updatePriceFunction = function(){
            const attribute = this.id;
            const classicInput = Number(document.getElementById("classicInput").value.trim().replaceAll(" ", ""));
            const timelessInput = Number(document.getElementById("timelessInput").value.trim().replaceAll(" ", ""));
            const alwaysInput = Number(document.getElementById("alwaysInput").value.trim().replaceAll(" ", ""));
            const db = getDatabase();


            if(attribute == "changePrice_classic"){
                if(classicInput == ""){
                    alert("You cannot enter an empty value!")
                }else if(checkNumber(classicInput) == null){
                    alert("Input is not allowed");
                }else{
                    set(ref(db, "prices/classic"), classicInput)
                    .then(() => {
                      alert("Classic series price changed successfully.");
                      location.reload();
                    })
                    .catch((error) => {
                      console.log("Price not changed");
                    });
                }
            }else if(this.id == "changePrice_timeless"){
                if(timelessInput == ""){
                    alert("You cannot enter an empty value!")
                }else if(checkNumber(timelessInput) == null){
                    alert("Input is not allowed");
                }else{
                    set(ref(db, "prices/timeless"), timelessInput)
                    .then(() => {
                      alert("Timeless series price changed successfully.");
                      location.reload();
                    })
                    .catch((error) => {
                      console.log("Price not changed");
                    });
                }
            }else if(this.id == "changePrice_always"){
                if(alwaysInput == ""){
                    alert("You cannot enter an empty value!")
                }else if(checkNumber(alwaysInput) == null){
                    alert("Input is not allowed");
                }else{
                    set(ref(db, "prices/always"), alwaysInput)
                    .then(() => {
                      alert("Always series price changed successfully.");
                      location.reload();
                    })
                    .catch((error) => {
                      console.log("Price not changed");
                    });
                }
            }
        }

        for(var i=0; i<submitButtons.length; i++){
            submitButtons[i].addEventListener("click", updatePriceFunction, false)
        }


    
}



const moreDetailsPage = document.getElementById("moreDetailsContainer");
if(moreDetailsPage != null){
    const fetchedDetails_localStorage = JSON.parse(localStorage.getItem("helloAgainAdminTemp_moreDetails"));
    console.log(fetchedDetails_localStorage.itemID) //receiptNumber
    const moreDetailsTable = document.getElementById("moreDetailsTable");
    var tableBody = document.createElement("tbody");
    moreDetailsTable.appendChild(tableBody);

    const customerUUID = fetchedDetails_localStorage.customeruuid;
    
    for(const item in fetchedDetails_localStorage.itemID){  
        for(const individualCartItem in fetchedDetails_localStorage.itemID[item]){
            
            
            function downloadImage(){
                return new Promise((resolve, reject) => {
                    const itemType = fetchedDetails_localStorage.itemID[item][individualCartItem].itemType;
                    const itemuuid = fetchedDetails_localStorage.itemID[item][individualCartItem].item_uuid;
                    const itemMessage = fetchedDetails_localStorage.itemID[item][individualCartItem].message;
                    var tableRow = document.createElement("tr")
                    const list_individualItemDetails = [itemType, itemuuid, itemMessage];
                    list_individualItemDetails.forEach((detail) => {
                        const tableData = document.createElement("td");
                        tableData.innerHTML = detail;
                        tableRow.appendChild(tableData);
                    });

                    const storage = getStorage();
                    // console.log(customerUUID + "/" + itemuuid);
                    try{
                        getDownloadURL(sref(storage, customerUUID + "/" + itemuuid))
                        .then((url) => {
                            const downloadImageButton = document.createElement("a");
                            downloadImageButton.setAttribute("href", url);
                            downloadImageButton.setAttribute("download", "polaroidImg");
                            downloadImageButton.innerHTML = "<button>Download image</button>";
    
                            const downloadImageButtonTD = document.createElement("td");
                            downloadImageButtonTD.appendChild(downloadImageButton);
                            tableRow.appendChild(downloadImageButtonTD);
                            tableBody.appendChild(tableRow);
                            resolve();
                        })
                        .catch((error) => {
                            if (error.code === 'storage/object-not-found') {
                                const downloadImageButtonTD = document.createElement("td");
                                tableRow.appendChild(downloadImageButtonTD);
                                tableBody.appendChild(tableRow);
                                return Promise.resolve(false);
                            } else {
                            return Promise.reject(error);
                            }
                        reject();
                        // Handle any errors
                        });
                    }catch{
                        const downloadImageButtonTD = document.createElement("td");
                        tableRow.appendChild(downloadImageButtonTD);
                        tableBody.appendChild(tableRow);
                    }
                    

                });
            }
            async function proceduralFunct(){
                await downloadImage();
            }
            proceduralFunct();
        }

    }

}else{
    localStorage.removeItem("helloAgainAdminTemp_moreDetails");
}

