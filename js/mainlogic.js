var editableGrid = new EditableGrid("DemoGrid", {
  sortIconUp: "assets/up.png",
  sortIconDown: "assets/down.png",
  editmode: "static",
  editorzoneid: "edition",
  pageSize: 100,
  maxBars: 10
});

// helper for displaying message
function displayMessage(text, style) {
  _$("message").innerHTML = "<p class='" + (style || "ok") + "'>" + text + "</p>";
}

// initialize our editable grid
EditableGrid.prototype.initializeGrid = function()
{
    with(this) {

      setCellEditor("from_email", new TextCellEditor());
      setCellEditor("to_email", new TextCellEditor());

      addCellValidator("from_email", new EmailCellValidator());
      addCellValidator("to_email", new EmailCellValidator());

      modelChanged = function(rI, cI, oV, nV, row) {
        displayMessage("Value for " + this.getColumnName(cI) + " row " + this.getRowId(rI) + " changed from " + oV + " to " + nV);
      };

      rowSelected = function(oldRowIndex, newRowIndex) {
      			if (oldRowIndex < 0) displayMessage("Selected row '" + this.getRowId(newRowIndex) + "'");
      			else displayMessage("Selected row has changed from '" + this.getRowId(oldRowIndex) + "' to '" + this.getRowId(newRowIndex) + "'");
      };

      // render the grid (parameters will be ignored if we have attached to an existing HTML table)
      renderGrid("tablecontent", "testgrid", "tableid");

      // set active (stored) filter if any
      _$('filter').value = currentFilter ? currentFilter : '';

      // filter when something is typed into filter
      _$('filter').onkeyup = function() { editableGrid.filter(_$('filter').value); };

    }
};

EditableGrid.prototype.onloadJSON = function(url)
{
  this.load({ metadata: [
    { name: "from_email", datatype: "string", editable: true },
    { name: "to_email", datatype: "string", editable: true }
  ]});

	// register the function that will be called when the JSON has been fully loaded
	this.tableLoaded = function() {
		displayMessage("Grid loaded from JSON: " + this.getRowCount() + " row(s)");
		this.initializeGrid();
	};

	// load JSON URL
	this.loadJSON(url);
};

EditableGrid.prototype.onloadHTML = function(tableID)
{
  this.load({ metadata: [
    { name: "from_email", datatype: "string", editable: true },
    { name: "to_email", datatype: "string", editable: true }
  ]});

  this.attachToHTMLTable(_$(tableID));
  displayMessage("Grid attached to HTML table: " + this.getRowCount() + " row(s)");

  this.initializeGrid();
};

EditableGrid.prototype.duplicate = function(rowIndex)
{
	// copy values from given row
	var values = this.getRowValues(rowIndex);
	values['name'] = values['name'] + ' (copy)';

	// get id for new row (max id + 1)
	var newRowId = 0;
	for (var r = 0; r < this.getRowCount(); r++) newRowId = Math.max(newRowId, parseInt(this.getRowId(r)) + 1);

	// add new row
	this.insertAfter(rowIndex, newRowId, values);
};
