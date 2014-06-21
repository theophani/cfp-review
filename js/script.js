(function () {

  // localStorage warppers
  Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
  };

  Storage.prototype.getObject = function(key) {
    try {
      return JSON.parse(this.getItem(key));
    } catch(e) {
      return {};
    }
  };
  // ---

  // loading/storing votes
  var ls_key = 'jseu-voting';
  function loadVotes() {
    if(!window.localStorage.getObject(ls_key)) {
      window.localStorage.setObject(ls_key, []);
    }
    return window.localStorage.getObject(ls_key);
  }

  function storeVotes(votes) {
    window.localStorage.setObject(ls_key, votes);
  }
  // ---

  var sheetUrl = prompt("Enter Google Spreadsheet URL",
      localStorage.getItem('sheetUrl') || '');
  localStorage.setItem('sheetUrl', sheetUrl);
  var sheetID = sheetUrl.match(/key=([^&]+)/)[1];
  var spreadsheetLink = "https://docs.google.com/a/github.com/spreadsheet/ccc?key=" + sheetID;

  // restore previous votes into the current vote form
  function loadValues() {
    var votes = loadVotes();
    var rowNo = parseInt($('#sheetRowNumber').val(), 10);
    // load persisted values
    var vote = votes[rowNo];
    if(!vote) {
      return;
    }
    $('#comment').val(vote.comment.replace(/\+/g, ' '));
    $('#vote_' + vote.vote).prop("checked", true);
  }

  function persistVote (e) {
    var vote = parseVote(($('#voter').serialize()));
    var votes = loadVotes();

    votes[vote.sheetRowNumber] = {
      vote: vote.vote,
      comment: vote.comment
    };
    storeVotes(votes);

    function successCallback () {
      $('body').css({ opacity: 1 });
    }
    $('body').css({ opacity: 0.5 });
    setTimeout(successCallback, 150);
    exportData(e);
    if (document.querySelector('#speed_mode').checked) {
      document.querySelector('.pagination-next-fullTable').click();
    }
  }

  var totalRows; // ugh global!
  function showInfo(data) {
    totalRows = data.length;
    data = data.map(function (proposal) {
      proposal.summary = proposal["summarytobeusedonsiteplaintextormarkdown3-5sentences."];
      proposal.extra = proposal["whatelseyouwanttotellusaboutthetalkoutsidethepublicsummary3-5sentences"];
      proposal.sheetRowNumber = proposal.rowNumber + 1;
      return proposal;
    })
    var tableOptions = {"data": data
    , "pagination": 1, "tableDiv": "#fullTable", "filterDiv": "#fullTableFilter"}
    Sheetsee.makeTable(tableOptions)
    Sheetsee.initiateTableFilter(tableOptions)
    loadValues();
    $('body').removeClass('loading');
  }

  document.addEventListener('DOMContentLoaded', function() {
    Tabletop.init( { key: sheetID, callback: showInfo, simpleSheet: true } )
  })

  // localStorage to csv
  function exportData(e) {
    e.preventDefault();
    var votes = loadVotes();
    var csv = '';
    for(var idx = 0; idx < totalRows; idx++) {
      var vote = votes[idx];
      if(vote) {
        csv += vote.vote + ',' + vote.comment + '\n';
      } else {
        csv += '\n';
      }
    }
    $('#export').val(csv).show();
  }

  // helper
  function parseVote(s) {
    var vote = {};
    var kvs = s.split('&');
    kvs.forEach(function(kv) {
      var k_v = kv.split('=');
      var key = k_v[0];
      var value = k_v[1];
      if(key != 'comment') {
        value = parseInt(value, 10);
      }
      vote[k_v[0]] = value;
    });
    return vote;
  }

  $('.content').on('change', 'form input', persistVote);
  $('.content').on('blur', 'form textarea', persistVote)
  $('#export-link').on('click', exportData);
  $(window).on('hashchange', loadValues);
}());
