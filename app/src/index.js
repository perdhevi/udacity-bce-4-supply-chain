import Web3 from "web3";
import metaSupplyChain from "../../build/contracts/SupplyChain.json";
import './style.css';

const App = {
    web3: null,
    account:null,
    meta:null,
    gasLimit : 6700000, 

    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 1,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.sku,
            App.upc,
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes, 
            App.productPrice, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID
        );
    },

    writeForm: function (result) {
        console.log(result.ownerID);
        const val = JSON.stringify(result, null, 2);
        console.log(val);
        $("#ftc-item").text(val);
        $("#ownerID").val(result.ownerID);
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3 = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
                console.log("using default metamask")
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            console.log('legacy Dapp');
            App.web3 = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3 = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: async function () {
        /// Source the truffle compiled smart contracts
        //var metaSupplyChain='../../build/contracts/SupplyChain.json';
        console.log('Initializin supply chain');

        const networkId = await web3.eth.net.getId();
        console.log(networkId);
        const deployedNetwork = metaSupplyChain.networks[networkId];
        this.meta = new web3.eth.Contract(
        metaSupplyChain.abi,
        deployedNetwork.address,
        );
        // get accounts
        const accounts = await web3.eth.getAccounts();
        console.log("accounts in metamask", accounts);
        const supplyChain = this.meta.methods;
        this.account = accounts[0];
        const isRtl = await supplyChain.isRetailer(this.account).call();
        if(!isRtl){
            await this.meta.methods.addRetailer(App.metamaskAccountID)
            .send({from:this.account, gasLimit:App.gasLimit});
        }
        const isCs = await supplyChain.isConsumer(this.account).call();
        if(!isCs){
            await this.meta.methods.addConsumer(App.metamaskAccountID)
            .send({from:this.account, gasLimit:App.gasLimit});
        }
        //set initial user for contract
        $("#originFarmerID").val(this.account);
        $("#distributorID").val(this.account);
        
        $("#retailerID").val(this.account);
        $("#consumerID").val(this.account);        

        //App.fetchItemBufferOne();
        //App.fetchItemBufferTwo();
        App.fetchEvents();

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            case 21:
                return await App.registerRetailer(event);
                break;
            case 22:
                return await App.registerConsumer(event);
                break;
            }
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        console.log('harvesting upc',App.upc);
        App.originFarmerID = App.metamaskAccountID;
        this.meta.methods.harvestItem(
            App.upc, 
            App.metamaskAccountID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes
        ).send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            console.log('harvestItem',result);
            App.writeForm(result);
        })
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('harvesting upc',App.upc);

        this.meta.methods.processItem(App.upc)
        .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('processItem',result);
        });

    },
    
    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        console.log('harvesting upc',App.upc);

        this.meta.methods.packItem(App.upc)
        .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('processItem',result);
        });

    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        console.log('harvesting upc',App.upc);

       
        this.meta.methods.sellItem(App.upc, App.productPrice)
        .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('sellItem',result);
        });        
    },

    buyItem: async function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        this.getMetaskAccountID();

        App.upc = $('#upc').val();
        App.retailerID = $("#retailerID").val();
        const buyPrice = 2;
        console.log('buyItem upc',App.upc);
        console.log('retailerID', App.retailerID);


        this.meta.methods.isRetailer(App.retailerID).call().then((result) => {
            console.log("app account is retailer:", result);
            if(result){
                this.meta.methods.buyItem(App.upc)
                .send({from:App.metamaskAccountID, value:buyPrice, gasLimit:App.gasLimit}).then(function(result) {
                    App.writeForm(result);
                    console.log('sellItem ',result);
                })
            }
        });        


    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        App.consumerID = $("#consumerID").val();        

        console.log('shipItem upc',App.upc);

        this.meta.methods.shipItem(App.upc)
        .send({from:App.account, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('shipItem ',result);
        });           
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        App.retailerID = $("#retailerID").val();
        console.log('receiveItem upc',App.upc);

        this.meta.methods.receiveItem(App.upc)
        .send({from:App.retailerID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('receiveItem ',result);
        });           

    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        App.consumerID = $("#consumerID").val();
        console.log('purchaseItem upc',App.upc);
        
        this.meta.methods.purchaseItem(App.upc)
        .send({from:App.consumerID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('purchaseItem ',result);
        });           


    },

    registerRetailer: function (event){
        event.preventDefault();
        App.retailerID = $("#retailerID").val();
        App.getMetaskAccountID();

        console.log(App.retailerID)
        console.log(App.metamaskAccountID)
        this.meta.methods.addRetailer(App.retailerID)
        .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('purchaseItem ',result);
        });                   
    },

    registerConsumer: function (event){
        event.preventDefault();

        App.consumerID = $("#consumerID").val();

        App.getMetaskAccountID();

        this.meta.methods.addConsumer(consumerID)
        .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('purchaseItem ',result);
        });                   
    },


    fetchItemBufferOne: async function () {
    //   event.preventDefault();
    //    var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc',App.upc);
        const { fetchItemBufferOne  } = this.meta.methods; 
        const result = await fetchItemBufferOne(App.upc).call({from:this.account, gasLimit:App.gasLimit});
        console.log('fetchItemBufferOne:', result);
        App.writeForm(result);
    },

    fetchItemBufferTwo: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc',App.upc);
        const { fetchItemBufferTwo  } = this.meta.methods;                         
        fetchItemBufferTwo(App.upc).call({from:this.account, gasLimit:App.gasLimit})
        .then(
        function(result) {
            App.writeForm(result);
            console.log('fetchItemBufferTwo', result);
        });
    },

    fetchEvents: function () {
        this.meta.events.allEvents({},function(err, log) {
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
