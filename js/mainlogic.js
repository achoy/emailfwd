var editableGrid = new EditableGrid("DemoGrid", {
  sortIconUp: "assets/up.png",
  sortIconDown: "assets/down.png",
  editmode: "absolute"
});

// helper for displaying message
function displayMessage(text, style) {
  _$("message").innerHTML = "<p class='" + (style || "ok") + "'>" + text + "</p>";
}

// initialize our editable grid
EditableGrid.prototype.initializeGrid = function()
{
    with(this) {

      setCellEditor("from_email", new TextCellEditor(30, 120, new EmailCellValidator()));
      setCellEditor("to_email", new TextCellEditor(30, 120, new EmailCellValidator()));

      modelChanged = function(rI, cI, oV, nV, row) {

        displayMessage("Value for " + this.getColumnName(cI) + " row " +
        this.getRowId(rI) + " changed from " + oV + " to " + nV;)

      };

      // render the grid (parameters will be ignored if we have attached to an existing HTML table)
      renderGrid("tablecontent", "testgrid", "tableid");

      // set active (stored) filter if any
      _$('filter').value = currentFilter ? currentFilter : '';

      // filter when something is typed into filter
      _$('filter').onkeyup = function() { editableGrid.filter(_$('filter').value); };

    }
};

EditableGrid.prototype.onloadHTML = function(tableID)
{
  this.load({ metadata: [
    { name: "from_email", datatype: "string", editable: true },
    { name: "to_email", datatype: "string", editable: true }
  ]});

  this.attachToHTMLTable(_$(tableID));

  this.initializeGrid();
};
