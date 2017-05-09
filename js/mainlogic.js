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

//helper function to get path of a demo image
function image(relativePath) {
	return "assets/" + relativePath;
}

function postresult(colName, row, value) {
  var form = document.createElement("form");
  var cole = document.createElement("input");
  var rowe = document.createElement("input");
  var vale = document.createElement("input");

  form.method = "POST";
  form.action = "/update/";

  cole.value = colName;
  cole.name = "from_field";
  form.appendChild(cole);

  rowe.value = row;
  rowe.name = "from_row";
  form.appendChild(rowe);

  vale.value = value;
  vale.name = "value";
  form.appendChild(vale);

  //document.body.appendChild(form);
  form.submit();

  displayMessage("Value for " + colName + " row " + row + " to " + value);

}

function addrow(rowid, from_email, to_email) {
  var form = document.createElement("form");
  var c1 = document.createElement("input");
  var c2 = document.createElement("input");
  var c3 = document.createElement("input");

  form.method = "POST";
  form.action = "/addrow/";

  c1.value = rowid;
  c1.name = "eid";
  form.appendChild(c1);

  c2.value = from_email;
  c2.name = "from_email";
  form.appendChild(c2);

  c3.value = to_email;
  c3.name = "to_email";
  form.appendChild(c3);

  //document.body.appendChild(form);
  form.submit();

  //displayMessage("Value for " + colName + " row " + row + " to " + value);

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
        postresult(this.getColumnName(cI), this.getRowId(rI), nV);
      };

      rowSelected = function(oldRowIndex, newRowIndex) {
      			if (oldRowIndex < 0) displayMessage("Selected row '" + this.getRowId(newRowIndex) + "'");
      			else displayMessage("Selected row has changed from '" + this.getRowId(oldRowIndex) + "' to '" + this.getRowId(newRowIndex) + "'");
      };

      // render for the action column
  		setCellRenderer("action", new CellRenderer({render: function(cell, value) {
  			// this action will remove the row, so first find the ID of the row containing this cell
  			var rowId = editableGrid.getRowId(cell.rowIndex);

  			cell.innerHTML = "<a onclick=\"if (confirm('Are you sure you want to delete this entry ? ')) { editableGrid.remove(" + cell.rowIndex + "); editableGrid.renderCharts(); } \" style=\"cursor:pointer\">" +
  			"<img src=\"" + image("delete.png") + "\" border=\"0\" alt=\"delete\" title=\"Delete row\"/></a>";

  			cell.innerHTML+= "&nbsp;<a onclick=\"editableGrid.duplicate(" + cell.rowIndex + ");\" style=\"cursor:pointer\">" +
  			"<img src=\"" + image("duplicate.png") + "\" border=\"0\" alt=\"duplicate\" title=\"Duplicate row\"/></a>";

  		}}));

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
	//values['name'] = values['name'] + ' (copy)';

	// get id for new row (max id + 1)
	var newRowId = 0;
	for (var r = 0; r < this.getRowCount(); r++) newRowId = Math.max(newRowId, parseInt(this.getRowId(r)) + 1);
  values['eid'] = newRowId

	// add new row
	this.insertAfter(rowIndex, newRowId, values);

  // need to update the server
  addrow(values['eid'], values['from_email'], values['to_email']);
};
