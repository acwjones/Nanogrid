var MasterList = "";
var overlayString = "GameOverlay";

$(document).ready(function () {

// Server Class.
function server(ip, name, port, map, players, maxPlayers, ping, retries, country) {
	var self = this;
	
    this.ip = ip;
    this.name = name;
    this.port = new Number(port);
    this.game = "naturalselection2";
    this.map = ko.observable(map);
    this.players = ko.observable(players);
    this.maxPlayers = ko.observable(maxPlayers);
    this.ping = ko.observable(ping);
    this.retries = ko.observable(retries);
    this.queryPort = self.port + 1;
    this.gametags = ko.observable();
    this.build = ko.observable();
    this.tickrate = ko.observable();
    // this.country = "<img src='img/flags/" + country + ".png' alt='" + country +"' class='flag' />";
    this.country = country;
    if (navigator.userAgent.search(overlayString) == -1) {
         this.connectURL = "steam://run/4920//connect " + this.ip + ":" + this.port;
    } else { 
        this.connectURL = "steam://connect/" + this.ip + ":" + this.queryPort
    }
    

}

// Creates an array of Server objects.
function getServers(data) {

	var i = 0;
	var servers = [];
	var array = $.parseJSON(data);
	var len = array.length;

		for (i; i < len; i++) {
		
			var temp = array[i]
		
			currentServer = new server(temp.ip, temp.name, temp.port, temp.map, temp.players, temp.maxplayers, temp.ping, temp.retries, temp.country);
			servers[i] = currentServer;
			
		}

	return servers;
		
}

function player(data) {

	this.name = data.Name;
	this.points = data.Frags;
	
}

function getPlayers(array) {

	var i = 0;
	var players = [];
	//var array = $.parseJSON(data);
	var len = array.length;

		for (i; i < len; i++) {
		
			var temp = array[i]
		
			currentPlayer = new player(temp);
			players[i] = currentPlayer;
			
		}

	return players;
		
}

// The NanoGrid ViewModel.
function ViewModel() {

	var self = this;
	var n = 0;              // Count variable for iterating through self.servers.
	var pSort = 0;		// Boolean value for sorting servers by players.
	var mSort = 0;		// Boolean value for sorting servers by maps.
	var nSort = 0;		// Boolean value for sorting servers by name.
        var pbsSort = 0;        // Boolean value for sorting players by score.
        var pbnSort = 0;        // Boolean value for sorting players by name.
	
	self.servers = ko.observableArray([]);
	self.players = ko.observableArray([]);
        placeholderServer = new server();
	self.dialogServer = ko.observable(placeholderServer);	// Placeholder server object for the dialog box.
        
        self.initjQUI = function() {
          
            $("#server-dialog").dialog({ 
                autoOpen: false, 
                modal: true,
                minWidth: 425,
                buttons: {
                    "Join": function() { window.location = self.dialogServer().connectURL; },
                    "Close": function() { $(this).dialog("close"); }
                }
            });

            $(".refresh-button").button();
            $(".join-button").button({
                icons: { primary: "ui-icon-circle-arrow-e" },
                text: false
            });
            $("#dialog-refresh").button({
                icons: { primary: "ui-icon-refresh" },
                text: false
            });
            
        };
        
        self.initjQUI();
        
	// Get the Master Server List and refresh the data on it.    
        $.get("nanogrid.php?a=1", function(data) {
		var servers = getServers(data);
		self.servers(servers);
		self.refreshList();
	});
        
	self.refreshList = function() {
	
		// Get the nth item in the servers array and format a query URL for it.	
		var len = self.servers().length;
		var item = self.servers()[n];
		var url = "nanogrid.php?a=2&ip=" + item.ip + "&p=" + item.queryPort;
		
		// Make the AJAX request and update the item with the returned data.
		var result = $.getJSON(url, function(data) {
			item.players(data.Players);
			item.maxPlayers(data.MaxPlayers);
			item.map(data.Map);
			item.gametags(data.GameTags);
			item.build(data.Build);
			item.tickrate(data.Tickrate);
                        
                        if (data.Players > 0) {
                            pSort = 0;
                            self.sortByPlayers();
                        }
                        
		});
		
		// Once complete, either call self.refreshList for the next item in the list, or reset n and sort by player count descending.			
		result.complete(function() { 
			n++; 
			if(n < len) {
				self.refreshList();
			} else {
				n = 0;
				pSort = 0;
				self.sortByPlayers();
			}
		});

	};
		
	// Dialog Functions.
	
	self.openDialog = function(data, event) {
	
		self.dialogServer(data);
		
		var url = "nanogrid.php?a=3&ip=" + self.dialogServer().ip + "&p=" + self.dialogServer().queryPort;
		
		var result = $.getJSON(url, function(data) {
			var players = getPlayers(data);
			self.players(players);
		});
		
		result.complete(function() { 
                        pbsSort = 0;
                        self.sortPlayersByScore();
			$("#server-dialog").dialog('open');
		});
	
	};
        
        self.refreshDialog = function() {
	
		var url = "nanogrid.php?a=3&ip=" + self.dialogServer().ip + "&p=" + self.dialogServer().queryPort;
		
		var result = $.getJSON(url, function(data) {
			var players = getPlayers(data);
			self.players(players);
		});
		
		result.complete(function() { 
                        pbsSort = 0;
                        self.sortPlayersByScore();
		});

	};
	
	self.closeDialog = function() {
	
		$("#server-dialog").dialog('close');
	
	};
		
		
	// Sorting Functions.
	
	self.sortByPlayers = function() {
		if (pSort == 0) {
			self.servers.sort(function(a,b) {
				return b.players() - a.players();
			});
			pSort = 1;
		} else {
			self.servers.sort(function(a,b) {
				return a.players() - b.players();
			});
			pSort = 0;
		}
	};
	
	self.sortByMaps = function() {
		if (mSort == 0) {	
			self.servers.sort(function(a,b) {
				return a.map() == b.map() ? 0 : (a.map() < b.map() ? -1 : 1);
			});
			mSort = 1;
		} else {
			self.servers.sort(function(a,b) {
				return a.map() == b.map() ? 0 : (a.map() > b.map() ? -1 : 1);
			});
			mSort = 0;
		}
	};
	
	self.sortByNames = function() {
		if (nSort == 0) {	
			self.servers.sort(function(a,b) {
				return a.name == b.name ? 0 : (a.name < b.name ? -1 : 1);
			});
			nSort = 1;
		} else {
			self.servers.sort(function(a,b) {
				return a.name == b.name ? 0 : (a.name > b.name ? -1 : 1);
			});
			nSort = 0;
		}
	};
        
        self.sortPlayersByScore = function() {
		if (pbsSort == 0) {
			self.players.sort(function(a,b) {
				return b.points - a.points;
			});
			pbsSort = 1;
		} else {
			self.players.sort(function(a,b) {
				return a.points - b.points;
			});
			pbsSort = 0;
		}
	};
        
        self.sortPlayersByName = function() {
		if (pbnSort == 0) {	
			self.players.sort(function(a,b) {
				return a.name == b.name ? 0 : (a.name < b.name ? -1 : 1);
			});
			pbnSort = 1;
		} else {
			self.players.sort(function(a,b) {
				return a.name == b.name ? 0 : (a.name > b.name ? -1 : 1);
			});
			pbnSort = 0;
		}
	};
        
}

// Custom Binding Handlers

// Animate a row when it's updated.
ko.bindingHandlers.animateChange = {
    update: function(element, valueAccessor, allBindingsAccessor) {
        // First get the latest data that we're bound to
        var value = valueAccessor(), allBindings = allBindingsAccessor();
         
        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.utils.unwrapObservable(value); 
         
        // Now manipulate the DOM element
        $(element).animate( {backgroundColor: "#aed7ff"}, 100); // Animate to blue flash.
		if (valueUnwrapped > 0) {
			$(element).animate( {backgroundColor: "#577A8D"}, 300); // Highlight if there are players in the server.
		} else {
			$(element).animate( {backgroundColor: "#333333"}, 300); // Otherwise return to base colour.
        }
    }
};

// Hide when no data are returned.
ko.bindingHandlers.checkOnline = {
    update: function(element, valueAccessor, allBindingsAccessor) {
        // First get the latest data that we're bound to
        var value = valueAccessor(), allBindings = allBindingsAccessor();
         
        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.utils.unwrapObservable(value); 
         
        // Now manipulate the DOM element
		if (valueUnwrapped == undefined) {
			$(element).hide();
		} else {
			$(element).show();
		}

        
    }
};

ko.applyBindings(new ViewModel());
		
});


