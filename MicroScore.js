// objects and data
(function () {
	var teams = [];
	var tours = [];
	var allLeads = [];
	var tourCount = 0;

	var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1HoHx349IzwCtDu1TZEIwe-lY2uXWCJz8QIYL36Ur3cM/edit'; //prod 2017-2018
	//var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/14XNcqz9cTWRwXPy6myARyWL8g4qEBWkS4jz2S4vJu44/pubhtml'; //prod 2016-2017
	//var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1hdAunhHHePMEdd0IqZXzN2e8IcQligaoV2YZUt71ehs/pubhtml'; //prod 2015-2016
	//var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1M2J8TILI8Qb8c5TjEBv0k065tOXZrtM0O36zMujysgc/pubhtml'; //prod 2014-2015
	//var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0ArS_x_k82ET4dExRTks4MHNHLXJwM09wYk9fRDdyYnc&output=html'; //prod 2013-2014
	//var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0ArS_x_k82ET4dFM1TDdVdnZTSjJSZkI5WTN0b0lUNnc&output=html'; //staging


	function ToursMatch(teamScore, guestScore) {
		this.teamScore = teamScore;
		this.guestScore = guestScore;
	}

	function TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, tourLabel) {
		this.teamScore = teamScore;
		this.guestScore = guestScore;
		this.isTeamLead = isTeamLead;
		this.isGuestLead = isGuestLead;
		this.isTeamB = isTeamB;
		this.isGuestB = isGuestB;
		this.tourLabel = tourLabel;
	}

	function Result(teamName, score) {
		this.teamName = teamName;
		this.teamId = 0;
		this.score = score;
	}

	function CommonTour(tourId, leads, tourA, tourB) {
		this.tourId = tourId;
		this.leads = leads;
		this.A = tourA;
		this.B = tourB;
	}

	function Tour(tourId, tourType, results, state) {
		this.results = results;
		this.tourId = tourId;
		this.tourType = tourType;
		this.state = state;
		this.max = 0;
	}

	function Team(teamId, teamName) {
		this.teamId = teamId;
		this.teamName = teamName;
		this.wins = 0;
		this.draws = 0;
		this.loses = 0;
		this.points = 0;
		this.wasLead = false;
		this.totalTours = 0;
		this.percents = 0;
		this.place = 0;
	}

	function TeamPercent (tourLabel, tourScore, tourMax) {
		this.tourLabel = tourLabel;
		this.score = tourScore;
		this.max = tourMax;
		this.tourPercent = (Math.round(tourScore * 1000 / (tourMax > 0 ? tourMax : 1)) / 10);
	}

	// ko view model
	var microViewModel = new MicroViewModel();

	function MicroViewModel() {
		var self = this;
		// observables
		self.isMatchesWindowVisible = ko.observable(false);
		self.isPercentsWindowVisible = ko.observable(false);
		self.isMaskVisible = ko.observable(false);
		self.isUiVisible = ko.observable(false);

		self.teams = ko.observableArray(teams);

		self.matches = ko.observableArray([]);
		self.teamName = ko.observable("");
		self.guestName = ko.observable("");
		self.teamScore = ko.observable(0);
		self.guestScore = ko.observable(0);
		
		self.sortType = ko.observable(1);	 // TODO: replace this ugly sorting switch (1 for score-based, 2 for alphabetical)

		self.lastTour = ko.observable(" - ");
		self.lastTourType = ko.observable(" - ");

		self.teamPercents = ko.observableArray([]);
		self.teamPercentsTotal = ko.computed(function () {
			var total = 0;
			self.teamPercents().forEach(function (item, i) {
				total += item.tourPercent;		
			});
			return total;
		});
		self.teamPercentsTotalDisplay = ko.computed(function () {
			return self.teamPercentsTotal().toFixed(1);
		});
		self.teamPercentAverage = ko.computed(function () {
			return (self.teamPercentsTotal() / self.teamPercents().length).toFixed(1)
		});

		//computed
		self.matchesScore = ko.computed(function () {
			return self.teamScore() + " : " + self.guestScore();
		}, this);

		self.matchesStyle = ko.computed(function () {
			return self.teamScore() > self.guestScore() ? 'win' : (self.teamScore() < self.guestScore() ? 'lose' : 'draw');
		}, this);

		self.clearWindow = function () {
			self.matches([]);
			self.teamName("");
			self.guestName("");
			self.teamScore(0);
			self.guestScore(0);
			self.teamPercents([]);
			
			self.isMatchesWindowVisible(false);
			self.isPercentsWindowVisible(false);
			self.isMaskVisible(false);
		};
	}

	// common functions
	function cellClick(cell) {
		var teamId = cell.dataset.teamid;
		var guestId = cell.dataset.guestid;
		var teamPlace = cell.dataset.teamplace;
		var teamName = cell.dataset.teamname;
		var cellVal = cell.dataset.val;

		var derbyFlag = cell.classList.contains("derby");
	
		if (teamId && guestId && teamId != guestId) {
			var teamName = getNameById(teamId);
			var guestName = getNameById(guestId);
			var teamScore = 0;
			var isTeamLead = false;
			var isTeamB = false;
			var guestScore = 0;
			var isGuestLead = false;
			var isGuestB = false;

			microViewModel.clearWindow();

			if (teamId != guestId) {
				microViewModel.teamName(getNameById(teamId));
				microViewModel.guestName(getNameById(guestId));

				tours.forEach(function (tour, i) {
					var k = i + 1;
					var teamAResult, teamBResult, guestAResult, guestBResult;
					tour.A.results.forEach(function (result, j) {
						if (result.teamId == teamId) {
							teamAResult = result;
						} else if (result.teamId == guestId) {
							guestAResult = result;
						}
					});

					tour.B.results.forEach(function (result, j) {
						if (result.teamId == teamId) {
							teamBResult = result;
						} else if (result.teamId == guestId) {
							guestBResult = result;
						}
					});

					if (tour.leads.indexOf(teamName) == -1 && tour.leads.indexOf(guestName) == -1) { //both teams was leads
						if (teamBResult != undefined && guestBResult != undefined) { //both is in B
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = true;
							isGuestB = true;
							teamScore = teamBResult.score;
							guestScore = guestBResult.score;

							if (teamScore > guestScore) {
								microViewModel.teamScore(microViewModel.teamScore() + 1);
							} else if (teamScore < guestScore) {
								microViewModel.guestScore(microViewModel.guestScore() + 1);
							}
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + "-Б" : "Финал"));
						}

						if (teamAResult != undefined && guestAResult != undefined) { //both is in A
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = false;
							isGuestB = false;
							teamScore = teamAResult.score;
							guestScore = guestAResult.score;

							if (teamScore > guestScore) {
								microViewModel.teamScore(microViewModel.teamScore() + 1);
							} else if (teamScore < guestScore) {
								microViewModel.guestScore(microViewModel.guestScore() + 1);
							}
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + "-А" : "Финал"));
						}

						if (teamAResult != undefined && teamBResult == undefined
							&& guestAResult == undefined && guestBResult != undefined) { //хозяева играли в А, не играли в Б, гости не вышли из Б
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = false;
							isGuestB = true;
							teamScore = teamAResult.score;
							guestScore = 0;

							microViewModel.teamScore(microViewModel.teamScore() + 1);
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + "-А" : "Финал"));
						}

						if (teamAResult == undefined && teamBResult != undefined
							&& guestAResult != undefined && guestBResult == undefined) { //гости играли в А, не играли в Б, хозяева не вышли из Б
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = true;
							isGuestB = false;
							teamScore = 0;
							guestScore = guestAResult.score;

							microViewModel.guestScore(microViewModel.guestScore() + 1);
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + "-А" : "Финал"));
						}

						if ((teamAResult != undefined || teamBResult != undefined)
							&& guestAResult == undefined && guestBResult == undefined) { //хозяева играли в любой из лиг, гости ни в одной из лиг
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = teamBResult != undefined && teamAResult == undefined;
							isGuestB = null;
							teamScore = teamAResult != undefined ? teamAResult.score : teamBResult.score;
							guestScore = 0;

							microViewModel.teamScore(microViewModel.teamScore() + 1);
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + (isTeamB ? "-Б" : "-А") : "Финал"));
						}

						if (teamAResult == undefined && teamBResult == undefined
							&& (guestAResult != undefined || guestBResult != undefined)) {//гости играли в любой из лиг, хозяева ни в одной из лиг
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = null;
							isGuestB = guestBResult != undefined && guestAResult == undefined;
							teamScore = 0;
							guestScore = guestAResult != undefined ? guestAResult.score : guestBResult.score;

							microViewModel.guestScore(microViewModel.guestScore() + 1);
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + (isGuestB ? "-Б" : "-А") : "Финал"));
						}

						if (teamAResult == undefined && guestAResult == undefined
							&& teamBResult == undefined && guestBResult == undefined) { //обе пропустили
							isTeamLead = false;
							isGuestLead = false;
							isTeamB = null;
							isGuestB = null;
							teamScore = 0;
							guestScore = 0;
							microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + "-А(Б)" : "Финал"));
						}
					}
					else if (tour.leads.indexOf(teamName) > -1 && tour.leads.indexOf(guestName) == -1) { //team is tour lead
						isTeamLead = true;
						isGuestLead = false;
						isTeamB = false;
						isGuestB = guestAResult == undefined;
						teamScore = 0;
						guestScore = guestAResult != undefined ? guestAResult.score : (guestBResult != undefined ? guestBResult.score : 0);
						microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + (isGuestB ? "-Б" : "-А") : "Финал"));
					}
					else if (tour.leads.indexOf(teamName) == -1 && tour.leads.indexOf(guestName) > -1) { //guest is tour lead
						isTeamLead = false;
						isGuestLead = true;
						isTeamB = teamAResult == undefined;
						isGuestB = false;
						teamScore = teamAResult != undefined ? teamAResult.score : (teamBResult != undefined ? teamBResult.score : 0);
						guestScore = 0;
						microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + (isTeamB ? "-Б" : "-А") : "Финал"));
					}
					else { //both is tour leads
						isTeamLead = true;
						isGuestLead = true;
						isTeamB = false;
						isGuestB = false;
						teamScore = 0;
						guestScore = 0;
						microViewModel.matches.push(new TourMatch(teamScore, isTeamLead, isTeamB, guestScore, isGuestLead, isGuestB, k < 7 ? k + "-А(Б)" : "Финал"));
					}
				});
			}
			microViewModel.isMatchesWindowVisible(true);
			microViewModel.isMaskVisible(true);

			var resultsEl =  document.getElementById("results");
			if (resultsEl && derbyFlag) {
				resultsEl.classList.add("derbyContainer");
			}
			else {
				resultsEl.classList.remove("derbyContainer");
			}

			resizeWindow();
		}
	}

	function headerClick(cell) {

		var teamName = cell.dataset.teamname;
		var teamPlace = cell.dataset.teamplace;
				
		if (teamPlace && teamName) {
			if (parseInt(cell.innerHTML) > 0) {
				cell.innerHTML = teamName;
			}
			else {
				cell.innerHTML = teamPlace;
			}
		}
	}

	function percentsClick(cell) {
		
		var teamId = cell.dataset.teamid;

		if(teamId != null) {
			microViewModel.teamName(getNameById(teamId));
			
			tours.forEach(function (tour, i) {
					var k = i + 1;
					var teamAResult, teamBResult;
					var tourAMax, tourBMax;
					var label;
					tour.A.results.forEach(function (result, j) {
						if (result.teamId == teamId) {
							teamAResult = result.score;
							tourAMax = tour.A.max;
						}
					});

					tour.B.results.forEach(function (result, j) {
						if (result.teamId == teamId) {
							teamBResult = result.score;
							tourBMax = tour.B.max;
						}
					});
					
					if(teamBResult != null) {
						label = k < 7 ? (tour.tourId + "-Б") : "Финал";
						microViewModel.teamPercents.push(new TeamPercent(label, teamBResult, tourBMax));
					}
					
					if(teamAResult != null) {
						label = k < 7 ? (tour.tourId + "-A") : "Финал";
						microViewModel.teamPercents.push(new TeamPercent(label, teamAResult, tourAMax));
					}
				});
			
			microViewModel.isPercentsWindowVisible(true);
			microViewModel.isMaskVisible(true);
			
			resizeWindow();
		}
	}

	function checkLead(team) {
		var flag = false;
		allLeads.forEach(function (lead, j) {
			if (lead == team.teamName) {
				flag = true;
			}
		});
		return flag;
	}

	function cellHover(e) {
		var teamId = e.dataset.teamid;
		var guestId = e.dataset.guestid;
			if (teamId && guestId && teamId != guestId) {
				microViewModel.teamName(getNameById(teamId));
				microViewModel.guestName(getNameById(guestId));
				document.el.floatingTitleEl.style.display = "block";
			}
			else {
				document.el.floatingTitleEl.style.display = "none";
			}
	}

	function headHover() {
		document.el.floatingTitleEl.style.display = "none";
	}

	function compareResults(team, guest) {

		var teamScore = 0;
		var guestScore = 0;

		tours.forEach(function (tour, i) {
			var teamAResult, teamBResult, guestAResult, guestBResult;
			tour.A.results.forEach(function (result, j) {
				if (result.teamId == team.teamId) {
					teamAResult = result;
				} else if (result.teamId == guest.teamId) {
					guestAResult = result;
				}
			});

			tour.B.results.forEach(function (result, j) {
				if (result.teamId == team.teamId) {
					teamBResult = result;
				} else if (result.teamId == guest.teamId) {
					guestBResult = result;
				}
			});

			if (tour.leads.indexOf(team.teamName) == -1 && tour.leads.indexOf(guest.teamName) == -1) {
				if (teamAResult != undefined && guestAResult != undefined) { //обе играли лигу А
					if (teamAResult.score > guestAResult.score) {
						teamScore += 1;
					}
					else if (teamAResult.score < guestAResult.score) {
						guestScore += 1;
					}
				}
				if (teamBResult != undefined && guestBResult != undefined) { //обе играли лигу Б
					if (teamBResult.score > guestBResult.score) {
						teamScore += 1;
					}
					else if (teamBResult.score < guestBResult.score) {
						guestScore += 1;
					}
				}
				if (teamAResult != undefined && teamBResult == undefined
					&& guestAResult == undefined && guestBResult != undefined) { //хозяева играли в А, не играли в Б, гости не вышли из Б
					teamScore += 1;
				}
				if (teamAResult == undefined && teamBResult != undefined
					&& guestAResult != undefined && guestBResult == undefined) { //гости играли в А, не играли в Б, хозяева не вышли из Б
					guestScore += 1;
				}
				if ((teamAResult != undefined || teamBResult != undefined)
					&& guestAResult == undefined && guestBResult == undefined) { //хозяева играли в любой из лиг, гости ни в одной из лиг
					teamScore += 1;
				}
				if (teamAResult == undefined && teamBResult == undefined
					&& (guestAResult != undefined || guestBResult != undefined)) {//гости играли в любой из лиг, хозяева ни в одной из лиг
					guestScore += 1;
				}
			}
		});
		return new ToursMatch(teamScore, guestScore);
	}

	function sortByPoints(a, b) {
		return (b.points - a.points) || (b.percents - a.percents);
	}

	function sortByAlphabet(a, b) {
		var aName = a.teamName.toLowerCase();
		var bName = b.teamName.toLowerCase();
		return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	}

	function getNameById(id) {
		var name = "";
		teams.forEach(function (item, i) {
			if (item.teamId == id) {
				name = item.teamName;
				return false;
			}
		});
		return name;
	}

	function getIdByName(name) {
		var id = 0;
		teams.forEach(function (item, i) {
			if (item.teamName == name) {
				id = item.teamId;
				return false;
			}
		});
		return id;
	}

	function resizeWindow() {
		var winH = window.innerHeight;
		var winW = window.innerWidth;
		
		var popupEls = [];
		
		popupEls.push(document.getElementById("matches-window-container"));
		popupEls.push(document.getElementById("percents-window-container"));
		popupEls.forEach(function (item) {
			if(item) {
				item.style.top = winH / 2 - item.offsetHeight / 2 + "px";
				item.style.left = winW / 2 - item.offsetWidth / 2 + "px";
			}
		});
		
		var maskEl = document.getElementById("mask");
		if(maskEl) {
			maskEl.style.height = winH;
			maskEl.style.width = winW;
		}
	}

	function isTeamUniq(name) {
		var flag = true;
		var lowerName = name.toLowerCase();
		teams.forEach(function (team, i) {
			if (team.teamName.toLowerCase() == lowerName) {
				flag = false;
				return false;
			}
		});
		return flag;
	}

	function tableTopCallback(data, tabletop) {
		var amatch = /\d{1,1}-A/i;
		var bmatch = /\d{1,1}-B/i;

		var acount = 0;
		var bcount = 0;

		Object.keys(data).forEach(function (item, i) {
			if (item.match(amatch) != null && item.match(amatch).length > 0) {
				acount++;
			}
			if (item.match(bmatch) != null && item.match(bmatch).length > 0) {
				bcount++;
			}
		});

		toursCount = acount + bcount;

		if (bcount < 7 && acount < 7) {
			if (bcount > acount) {
				microViewModel.lastTour("Б " + bcount);
				microViewModel.lastTourType = data[bcount + "-B"].elements[0].State;
			} else if (bcount == acount) {
				microViewModel.lastTour("A " + bcount);
				microViewModel.lastTourType = data[bcount + "-A"].elements[0].State;
			}
		} else {
			microViewModel.lastTour("Финал");
			microViewModel.lastTourType = data[bcount + "-A"].elements[0].State;
		}
		for (var i = 0; i < toursCount / 2; i++) {
			var leads = [];

			var tourB = new Tour((i + 1), "B", data[(i + 1) + "-B"].elements.map(function (item) {
				if (item.Leads != null) {
					leads.push(item.Leads);
				}
				return new Result(item.Name, parseInt(item.Score));
			}), data[(i + 1) + "-B"].elements[0].State);

			var tourA = new Tour((i + 1), "A", data[(i + 1) + "-A"].elements.map(function (item) {
				if (item.Leads != null) {
					leads.push(item.Leads);
				}
				return new Result(item.Name, parseInt(item.Score));
			}), data[(i + 1) + "-A"].elements[0].State);

			tours.push(new CommonTour((i + 1), leads, tourA, tourB));
			leads.forEach(function (lead, k) {
				if (lead.length > 0) {
					allLeads.push(lead);
				}
			});
		}

		//calculations
		//fill teams array from tours array
		tours.forEach(function (tour, i) {

			tour.A.results.sort(function (a, b) { return b.score - a.score });
			tour.A.max = tour.A.results[0].score;

			if (tour.B.results.length > 0) {
				tour.B.results.sort(function (a, b) { return b.score - a.score });
				tour.B.max = tour.B.results[0].score;
			}

			tour.A.results.forEach(function (result, j) {
				if (result.teamId == 0) {
					if (isTeamUniq(result.teamName)) {
						var index = teams.length + 1;
						teams.push(new Team(index, result.teamName));
						result.teamId = index;
					} else {
						result.teamId = getIdByName(result.teamName);
					}
				}
			});

			tour.B.results.forEach(function (result, j) {
				if (result.teamId == 0) {
					if (isTeamUniq(result.teamName)) {
						var index = teams.length + 1;
						teams.push(new Team(index, result.teamName));
						result.teamId = index;
					} else {
						result.teamId = getIdByName(result.teamName);
					}
				}
			});
		});

		//calculate mathches
		teams.forEach(function (team, i) {
			team.wasLead = checkLead(team);
			teams.forEach(function (guest, j) {
				var cell = {
					value: "",
					style: ""
				};

				if (team.teamId != guest.teamId) {
					var match = compareResults(team, guest);
					if (match.teamScore > match.guestScore) {
						team.wins += 1;
						team.points += 2;
						cell.style = "win";
					}
					else if (match.teamScore == match.guestScore) {
						team.draws += 1;
						team.points += 1;
						cell.style = "draw";
					}
					else {
						team.loses += 1;
						cell.style = "lose";
					}
					cell.value = match.teamScore + " : " + match.guestScore;
				}  else {
					cell.value = " — ";
					cell.style = "self";
				}
				var tname = team.teamName.toLowerCase();
				var gname = guest.teamName.toLowerCase();

				if ((tname.indexOf("автостопом") != -1 && gname.indexOf("экспресс") != -1) || (gname.indexOf("автостопом") != -1 && tname.indexOf("экспресс") != -1)) {
					cell.style += " derby";
				}

				team["team" + guest.teamId] = cell;
			});

			//calculate percents and add table headers
			tours.forEach(function (tour, j) {
				var teamAResult, teamBResult;
				tour.A.results.forEach(function (result, j) {
					if (result.teamId == team.teamId) {
						teamAResult = result;
					}
				});

				tour.B.results.forEach(function (result, j) {
					if (result.teamId == team.teamId) {
						teamBResult = result;
					}
				});
				if (teamAResult != undefined && tour.A.max > 0) {
					team.percents += Math.round(teamAResult.score * 1000 / (tour.A.max > 0 ? tour.A.max : 1)) / 10;
					team.totalTours++;
				}
				if (teamBResult != undefined && tour.B.max > 0) {
					team.percents += Math.round(teamBResult.score * 1000 / (tour.B.max > 0 ? tour.B.max : 1)) / 10;
					team.totalTours++;
				}
			});

			team.percents = (team.percents / team.totalTours).toFixed(1);
		});

		switch (microViewModel.sortType()) {
			case 1:
				{
					teams.sort(sortByPoints);
					break;
				}
			case 2:
				{
					teams.sort(sortByAlphabet);
					break;
				}
		}

		var mainTableEl = document.getElementById("mainTable");
		var mainTableHeadEl = mainTableEl.querySelectorAll("thead tr")[0];
		var mainTableBodyEl = mainTableEl.querySelectorAll("tbody tr")[0];
		
		var neigbors = {};

		teams.forEach(function(team, i) {

			if (neigbors[team.points] == undefined) {
				neigbors[team.points] = {};
			}
			if (neigbors[team.points][team.percents] == undefined) {
				neigbors[team.points][team.percents] = [];
			}
			neigbors[team.points][team.percents].push({
				index: i,
				team: team
			})

			var th = document.createElement("th");
			th.classList.add("clickable");
			th.classList.add("headerPlace");
			th.dataset.teamplace = i + 1;
			th.dataset.teamname = team.teamName;
			th.innerHTML = i + 1;
			mainTableHeadEl.appendChild(th);
					
			var td = document.createElement("td");
			td.setAttribute("data-bind", "text: team" + team.teamId + ".value, css : team" + team.teamId + ".style, attr: {'data-teamid': teamId, 'data-guestid': " + team.teamId + "}");
			td.classList.add("clickable");
			td.classList.add("cell");
			mainTableBodyEl.appendChild(td);
			
		});

		for (var points in neigbors) {
			for (var percents in neigbors[points]) {
				var arr = neigbors[points][percents];
				if (arr.length > 1) {
					var first = arr[0].index + 1;
					var last = arr[arr.length - 1].index + 1;
					var place = (first + last) / 2.0;
					arr.forEach(function (item, i) {
						teams[item.index].place = place + " ("+ first + " - " + last +")";
					});
				} else {
					teams[arr[0].index].place = arr[0].index + 1;
				}
			}
		}

		ko.applyBindings(microViewModel);

		document.el.mainTableEl.style.display = "block";
		document.el.footerEl.style.display = "block";
		document.el.headerEl.style.display = "block";
		
	}

	function collectElements() {
		var el = {};
		
		el.mainTableEl = document.getElementById("mainTable");
		el.mainTableHeadEl = el.mainTableEl.querySelectorAll("thead tr")[0];
		el.mainTableBodyEl = el.mainTableEl.querySelectorAll("tbody tr")[0];
		el.headerEl = document.getElementById("header");
		el.footerEl = document.getElementById("footer");
		el.floatingTitleEl = document.getElementById("floatingTitle");
		el.maskEl = document.getElementById("mask");
		
		document.el = el;
	}

	function setupEvents() {
		document.el.mainTableEl.style.display = "none";
		document.el.footerEl.style.display = "none";
		document.el.headerEl.style.display = "none";
		document.el.floatingTitleEl.style.display = "none";
		
		document.el.mainTableEl.addEventListener("click", function (e) {
			if(e.target) {
				if(e.target.matches("td.cell")) {
					cellClick(e.target);
				} else if (e.target.matches("td.percents")) {
					percentsClick(e.target);
				} else if (e.target.matches("th.headerPlace")) {
					headerClick(e.target);
				}
			}
		});
		
		var mouseEventHandler = function (e) {
			if(e.target) {
				if(e.target.matches("td.cell")) {
					cellHover(e.target);
				} else if (e.target.matches("th.headerPlace") || e.target.matches("td.headcol")) {
					headHover(e.target);
				}
			}
		}
		
		document.el.mainTableEl.addEventListener("mouseover", mouseEventHandler);
		document.el.mainTableEl.addEventListener("mousemove", mouseEventHandler);
		document.el.mainTableEl.addEventListener("mouseenter", mouseEventHandler);
		
		document.el.maskEl.addEventListener("click", microViewModel.clearWindow);
		
		document.addEventListener("keydown", function (e) {
			if (e.keyCode === 27) {
				microViewModel.clearWindow();
			}
		});
	};
	
	//entry point
	document.init = function() {
		collectElements();
		
		setupEvents();
		
		Tabletop.init({
			key: public_spreadsheet_url,
			callback: tableTopCallback,
			simpleSheet: false
		})
	};
})();

document.addEventListener("DOMContentLoaded", document.init);