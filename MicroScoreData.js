function overridenResult(teamName, teamId, score) {
	var result = new Result(teamName, score);
	result.teamId = teamId;
	return result;
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

function Tour(tourId, tourType, results) {
	this.results = results;
	this.tourId = tourId;
	this.tourType = tourType;
	this.max = 0;
}

function Team(teamId, teamName) {
	this.teamId = teamId;
	this.teamName = teamName;
	this.wins = 0;
	this.draws = 0;
	this.loses = 0;
	this.points = 0;
	this.totalAnsweredQuestions = 0;
	this.totalMaxQuestions = 0;
	this.percents = 0;
}

var teams = [];

var tours = [];
var tourCount = 0;

