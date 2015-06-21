// cannot call document.getElementById('degreeCentralityContainer') outside function
var currentSelectedTag;
var Astatus = 1;

// init global var here
window.onload = function() {
	currentSelectedTag = document.getElementById('degreeCentralityContainer');
	currentSelectedTag.className = 'active';
	
	degreeCentralityClicked();
}

function changeBottomShowTableByData(data) {
	var node = maxN(data, 8);
	var body = new Array();
	for (var i = 0; i < node[0].length; ++i) {
		body[i] = new Array();
		body[i][0] = node[1][i];
		body[i][1] = node[0][i];
	}
	changeBottomShowTable(head, body);
}

var head = ["节点ID", "权重"];
function degreeCentralityClicked() {
	activeContainer('degreeCentralityContainer');
	// todo : add your code here
    Astatus = 1;
	
	changeBottomShowTableByData(degreeCentrality);
}

function eigenvectorCentralityClicked() {
	activeContainer('eigenvectorCentralityContainer');
	// todo : add your code here
    Astatus = 2;
	
	changeBottomShowTableByData(eigenvectorCentrality);
}


function katzCentralityClicked() {
	activeContainer('katzCentralityContainer');
	// todo : add your code here
    Astatus = 3;
	
	changeBottomShowTableByData(katzCentrality);
}


function betweennessCentralityClicked() {
	activeContainer('betweennessCentralityContainer');
	// todo : add your code here
    Astatus = 4;
	
	changeBottomShowTableByData(betweennessCentrality);
}


function closenessCentralityClicked() {
	activeContainer('closenessCentralityContainer');
	// todo : add your code here
    Astatus = 5;
	
	changeBottomShowTableByData(closenessCentrality);
}


function groupCentralityClicked() {
	activeContainer('groupCentralityContainer');
	// todo : add your code here
    force.onGroupCentrality();
}

function pageRankClicked() {
    activeContainer('pageRankContainer');
    // todo : add your code here
    Astatus = 6;
	
	changeBottomShowTableByData(PangRank);
}


function clusteringCoefficientClicked() {
	activeContainer('clusteringCoefficientContainer');
	// todo : add your code here
    Astatus = 7;

	changeBottomShowTableByData("");
}


function structuralEquivalenceClicked() {
	activeContainer('structuralEquivalenceContainer');
	// todo : add your code here

    Astatus = 8;

	changeBottomShowTableByData("");
}

function regularEquivalenceClicked() {
	activeContainer('regularEquivalenceContainer');
	// todo : add your code here
    Astatus = 9;
	
	changeBottomShowTableByData("");

}

function activeContainer(containerId) {
	// clean class
	currentSelectedTag.className = " ";
	var container = document.getElementById(containerId); 
	container.className = 'active';
	currentSelectedTag = container;
}


function changeBottomShowTable(head, body) {
	// clean content
	var bottomTable = document.getElementById("bottomShowTable");
	while (bottomTable.firstChild) {
		bottomTable.removeChild(bottomTable.firstChild);
	}
	
	// insert new content
	var table = document.createElement('table');
	var thead = table.createTHead(); 
	var tbody = table.createTBody(); 
	var tr = document.createElement("tr"); 
	
	// generate head
	for (var i = 0; i < head.length; i++) { 
		th = document.createElement("th"); 
		th.innerHTML = head[i]; 
		tr.appendChild(th); 
	} 
	thead.appendChild(tr); 
	// generate body
	for (var i = 0; i < body.length; i++) { 
		var tr = document.createElement("tr"); 
		for (var j = 0; j < body[i].length; j++) { 
			td = document.createElement("td"); 
			td.innerHTML = body[i][j];
			tr.appendChild(td); 
		} 
		tbody.appendChild(tr); 
	} 
	
	bottomTable.appendChild(table);

	table.className = "table table-striped";
}
