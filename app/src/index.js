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
        $("#ftc-item").text(JSON.stringify(result));
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
        /// JSONfy the smart contracts
        // $.getJSON(metaSupplyChain, function(data) {
        //     console.log('data',data);
        //     var SupplyChainArtifact = data;
        //     App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
        //     App.contracts.SupplyChain.setProvider(App.web3);
            
        //     App.fetchItemBufferOne();
        //     App.fetchItemBufferTwo();
        //     App.fetchEvents();

        // });
        const networkId = await web3.eth.net.getId();
        console.log(networkId);
        const deployedNetwork = metaSupplyChain.networks[networkId];
        this.meta = new web3.eth.Contract(
        metaSupplyChain.abi,
        deployedNetwork.address,
        );
        //App.contracts.SupplyChain = this.meta.methods
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
        console.log(isCs);

        //const { fetchEvents, fetchItemBufferOne , fetchItemBufferTwo } = this.meta.methods; 
        //App.FetchItemBufferOne();
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
            }
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        // App.contracts.SupplyChain.deployed()
        // .then(function(instance) {
        //     return instance.harvestItem(
        //         App.upc, 
        //         App.metamaskAccountID, 
        //         App.originFarmName, 
        //         App.originFarmInformation, 
        //         App.originFarmLatitude, 
        //         App.originFarmLongitude, 
        //         App.productNotes
        //     );
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('harvestItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
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

        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     return instance.processItem(App.upc, {from: App.metamaskAccountID});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('processItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
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

        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     return instance.packItem(App.upc, {from: App.metamaskAccountID});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('packItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
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

        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     const productPrice = web3.toWei(1, "ether");
        //     console.log('productPrice',productPrice);
        //     return instance.sellItem(App.upc, App.productPrice, {from: App.metamaskAccountID});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('sellItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
        this.meta.methods.sellItem(App.upc, App.productPrice)
        .send({from:App.metamaskAccountID, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('sellItem',result);
        });        
    },

    buyItem: async function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        console.log('buyItem upc',App.upc);

        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     const walletValue = web3.toWei(3, "ether");
        //     return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('buyItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
        this.meta.methods.isRetailer(App.account).call().then((result) => {
            console.log("app account is retailer:", result);
            if(result){
                this.meta.methods.buyItem(App.upc)
                .send({from:App.account, value:2, gasLimit:App.gasLimit}).then(function(result) {
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
        console.log('shipItem upc',App.upc);

        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     return instance.shipItem(App.upc, {from: App.metamaskAccountID});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('shipItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
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
        console.log('receiveItem upc',App.upc);

        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('receiveItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
        this.meta.methods.receiveItem(App.upc)
        .send({from:App.account, gasLimit:App.gasLimit}).then(function(result) {
            App.writeForm(result);
            console.log('receiveItem ',result);
        });           

    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.upc = $('#upc').val();
        console.log('purchaseItem upc',App.upc);
        
        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     return instance.purchaseItem(App.upc, {from: App.metamaskAccountID});
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('purchaseItem',result);
        // }).catch(function(err) {
        //     console.log(err.message);
        // });
        this.meta.methods.purchaseItem(App.upc)
        .send({from:App.account, gasLimit:App.gasLimit}).then(function(result) {
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
        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //   return instance.fetchItemBufferOne(App.upc);
        // })
        const result = await fetchItemBufferOne(App.upc).call({from:this.account, gasLimit:App.gasLimit});
        // fetchItemBufferOne(App.upc).call({from:this.account, gasLimit:App.gasLimit}, (result) => {
          
          App.writeForm(result);
          console.log('fetchItemBufferOne', result);
        // });
    },

    fetchItemBufferTwo: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc',App.upc);
        const { fetchItemBufferTwo  } = this.meta.methods;                         
        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //   return instance.fetchItemBufferTwo.call(App.upc);
        // })
        fetchItemBufferTwo(App.upc).call({from:this.account, gasLimit:App.gasLimit})
        .then(
        function(result) {

            App.writeForm(result);
            console.log('fetchItemBufferTwo', result);
        });
    },

    fetchEvents: function () {
        /*
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }*/

        //App.contracts.SupplyChain.deployed().then(function(instance) {
        //var events = instance.allEvents(function(err, log){
        this.meta.events.allEvents({},function(err, log) {
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        // }).catch(function(err) {
        //   console.log(err.message);
        // });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
