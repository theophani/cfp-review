(function () {

  var sheetID = "ENTER THE SHEET ID HERE";
  var spreadsheetLink = "https://docs.google.com/a/github.com/spreadsheet/ccc?key=" + sheetID;
  var cellUrlPrefix = "https://spreadsheets.google.com/feeds/cells/"+ sheetID +"/ocw/public/basic/";

  function cellAddress(row, column) {
    return 'R' + row + 'C' + column;
  }

  function createEntryElem(row, column, inputValue) {
    var entry = document.createElement('entry');
    entry.setAttribute('xmlns', "http://www.w3.org/2005/Atom");
    entry.setAttribute('xmlns:gs', "http://schemas.google.com/spreadsheets/2006");
    entry.innerHTML = '<id>https://spreadsheets.google.com/feeds/cells/key/'+sheetID+'/private/full/'+cellAddress(row, column)+'</id><link rel="edit" type="application/atom+xml" href="https://spreadsheets.google.com/feeds/cells/key/'+sheetID+'/private/full/'+cellAddress+'"/><gs:cell row="'+row+'" col="'+column+'" inputValue="'+inputValue+'"/>';
    return entry;
  }

  function persistChoice (e) {
    $('body').css({ opacity: 0.5 });

    // need to know who is voting i.e. which columns to persist vote and remarks
    var row = 2;
    var column = 25;
    var choice = e.target.value;
    var entry = createEntryElem;

    $.ajax({
      type: 'PUT',
      url: cellUrlPrefix + cellAddress(row, column),
      contentType: 'application/atom+xml',
      data: entry,
      success: function () {
        $('body').css({ opacity: 1 });
      }
    });
  }

  function persistRemark (e) {
    persistChoice(e);
  }

  function showInfo(data) {
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
    $('body').removeClass('loading');
  }

  document.addEventListener('DOMContentLoaded', function() {
    Tabletop.init( { key: sheetID, callback: showInfo, simpleSheet: true } )
  })

  $('.content').on('change', 'form input', persistChoice);
  $('.content').on('blur', 'form textarea', persistRemark)
}());
