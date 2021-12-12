App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
    App.account = account;
    $("#accountAddress").html("Your Account: " + account);
    }
    });
    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
    var candidatesResults = $("#candidatesResults");
    candidatesResults.empty();
    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();
    for (var i = 1; i <= candidatesCount; i++) {
    electionInstance.candidates(i).then(function(candidate) {
    var avatar = candidate [2];
    var id = candidate[0];
    var name = candidate[1];
    var voteCount = candidate[3];
    // Render candidate Result
    var candidateTemplate = "<tr><th> <img style=\"width:50px;height:50px; border-radius:50%\" class=\"avatar\" data-holder-rendered=\"true\" src=\"" + avatar + " \" /> </th><th>" + id + "</th><td>" + name +
    "</td><td class=\'vote\'>" + voteCount + "</td>" +  "<td><input type=\"checkbox\" id=" + id + " onclick=\'App.check_uncheck();\' name=\"checked\" class=\"checked\"> </td></tr>"
    candidatesResults.append(candidateTemplate);
    });
    }
    return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
    // Do not allow a user to vote
    if(hasVoted) {
      $('.checked').attr("disabled", true);
    } else {
      $('.vote').hide();
    }
    loader.hide();
    content.show();
    }).catch(function(error) {
    console.warn(error);
    });
    }
  ,
  check_uncheck: function(){
    var candidateId = $('.checked');
  //bch ne7ssb 9adeh mn condidate non checked, kn lkol non checked m3neha lzm l checkbox enabled, w kn 
  //fama w7da checked lzmhom ywaliw disabled bch mynjmch yeckliki 3ala akther mn wa7da
    var i = 0;
  //bch ne5th 9adeh 3ndi mn condidate f tableau
    const condidateLength = candidateId.length;
  // console.log(condidateLength)
    $.each(candidateId, function( index ) {
      var candidateid = $(`#${index+1}`);
      if (!candidateid.is(":checked")) {
        i = i+1;
        //console.log(candidateId[index].id);
        candidateid.attr("disabled", true);
        } 
      } )
    //console.log(i)
    //ki y3ml check l checkbox w b3d unchecked te5dm l function hethi
    if (i===condidateLength){
      $.each(candidateId, function( index ) {
      var candidateid = $(`#${index+1}`);
      candidateid.attr("disabled", false);
      } )
    }
  }  ,
  castVote: function(event) {
    // ma7abtch temchi event.preventdefault.
    // event.preventDefault();
    // event.stopPropagation();
    var candidateId = $('.checked');
    $.each(candidateId, function( index ) {
      var candidateid = $(`#${index+1}`);
      if (candidateid.is(":checked")) {
        console.log(candidateId[index].id);
        candidateid = candidateId[index].id;
        App.contracts.Election.deployed().then(function(instance) {return instance.vote(candidateid, { from: App.account });
        }).then(function(result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
        }).catch(function(err) {
          console.error(err);
        });
      } 
    });
    // Kelmt votes f tableau mt7bch tothher kn b3d mn3ml refresh, etheika 3leh zdneha reload automatique
    window.location.reload()
    },
    listenForEvents: function() {
      App.contracts.Election.deployed().then(function(instance) {
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("event triggered", event)
          // Reload when a new vote is recorded
          App.render();
        });
      });
    },
    initContract: function() {
      $.getJSON("Election.json", function(election) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);
    
        App.listenForEvents();
    
        return App.render();
      });
    }
};

$(function() {
  $(window).load(function() {
    App.init();   
  });
});