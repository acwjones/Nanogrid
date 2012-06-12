var MasterList = "";

$(document).ready(function () {

function server(ip, port) {

	var self = this;
	
	self.ip = ip;
    self.name = ko.observable();
    self.port = port;
    self.game = "naturalselection2";
    self.map = ko.observable();
    self.players = ko.observable();
    self.maxPlayers = ko.observable();
    self.ping = ko.observable();
    self.retries = ko.observable();
    self.queryPort = self.port + 1;
	
}

function updateServers(servers, array) {

		var i = 0;
		var len = servers().length;
	
		
		for (i; i < len; i++) {
		
			servers()[i].players = array[i].Players;
		
		}

}

function ViewModel() {

	var self = this;
	
	self.servers = ko.observableArray([
		new server("213.37.146.236", 27105),
		new server("62.65.106.53", 27020),
		new server("89.163.177.130", 27105)
	]);

	
	self.refreshList = function(){
	
		var i = 0;
		var len = self.servers().length;
		var array = [];
		
		for (i; i < len; i++) {
		
			var item = self.servers()[i];
			var url = "nanogrid.php?a=2&ip=" + item.ip +  "&p=" + item.queryPort;
			
			$.get(url, function(data) {
				var d = $.parseJSON(data);
				array.push(d)
			});
		
		}
		
		updateServers(self.servers, array);
		
	};
}

ko.applyBindings(new ViewModel());
		
});


