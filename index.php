﻿<?php
$hash = md5(filemtime('MicroScore.js'));
?><!DOCTYPE html>
<html>
<head>
    <title>Микроматчи сезона 2015/16</title>
    <meta http-equiv="Content-Language" content="ru">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link href='http://fonts.googleapis.com/css?family=PT+Sans:400,700&subset=cyrillic' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="http://code.jquery.com/jquery-2.0.2.min.js" type="text/javascript"></script>
    <script src="http://ajax.aspnetcdn.com/ajax/knockout/knockout-2.2.1.js" type="text/javascript"></script>
    <script src="tabletop.js" type="text/javascript"></script>
    <script src="MicroScore.js" type="text/javascript"></script>
</head>

<body>
    <table class="header" style="float: left">
        <tbody>
            <tr>
                <td>
                    Последний учтённый тур:
                </td>
                <td>
                    <span data-bind="text: lastTour" style="font-weight: bold"></span>
                </td>
            </tr>
            <tr>
                <td>
                    Состояние  результатов:
                </td>
                <td>
                    <span data-bind="text: lastTourType" style="font-weight: bold"></span>
                </td>
            </tr>
        </tbody>
    </table>

    <table id="floatingTitle">
        <tbody>
            <tr>
                <td>
                    <span data-bind="text: teamName"></span>
                </td>
                <td>
                    <span>— </span>
                </td>
                <td>
                    <span data-bind="text: guestName"></span>
                </td>
            </tr>
        </tbody>
    </table>

    <div style="display: none;">
        Options
        <div>
            <input type="radio" value="1" data-bind="checked: sortType" disabled="disabled" />
            Points
            <input type="radio" value="2" data-bind="checked: sortType" disabled="disabled" />
            Alphabet
        </div>
    </div>
    <table id="mainTable">
        <thead>
            <tr>
                <th title='Порядковый номер строки'>№</th>
                <th title='Среднее между первым и последним № у команд с равными показателями'>Место</th>
                <th>Название</th>
                <th title='Выигрыши'>В</th>
                <th title='Ничьи'>Н</th>
                <th title='Поражения'>П</th>
                <th title='Очки'>О</th>
                <!--<th title='Команда вела тур'>Вл</th>-->
                <!--<<th title='Взятые'>Вз</th>-->
				<!--<th title='Максимум по турам в которых играла команда'>М</th>-->
                <th title='Процент'>%</th>
            </tr>
        </thead>
        <tbody data-bind="foreach: teams">
            <tr>
                <td data-bind="text: $index() + 1" class="not-important"></td>
                <td data-bind="text: place"></td>
                <td data-bind="text: teamName"></td>
                <td data-bind="text: wins"></td>
                <td data-bind="text: draws"></td>
                <td data-bind="text: loses"></td>
                <td data-bind="text: points"></td>
                <!--<td>
                    <div data-bind="css: { dot: wasLead }" class="dot"></div>
                </td>-->
				<!--<<td data-bind="text: totalAnsweredQuestions"></td>-->
                <!--<td data-bind="text: totalMaxQuestions"></td>-->
                <td class="percents clickable" data-bind="text: percents, attr: {'data-teamid': teamId}"></td>
            </tr>
        </tbody>
    </table>

    <div id="mask" class="mask" data-bind="visible: isMaskVisible" style="display: block"></div>
    <div id="spinnerMask" class="mask spinner" data-bind="visible: !isUiVisible"></div>
    <div class="container" data-bind="visible: isMatchesWindowVisible" style="display: none">
        <div id="top">
            <div id="first">
                <span data-bind="text: teamName"></span>
            </div>
            <div id="score">
                <div data-bind="css: matchesStyle" class="scoreBack">
                    <span data-bind="text: matchesScore"></span>
                </div>
            </div>
            <div id="second">
                <span data-bind="text: guestName"></span>
            </div>
        </div>
        <div id="results">
            <ul data-bind="foreach: matches">
                <li>
                    <div class="tourLabel" data-bind="text: tourLabel + ':'">
                    </div>
                    <div class="left">
                        <span data-bind="text: isTeamLead ? 'Вели тур' : (isTeamB == null ? '0 (Н)' : (!isTeamB ? teamScore : (isTeamB && (isGuestB || isGuestB == null) ? teamScore + ' (Б)' : '0 (Б)'))), css: { boldText: !isTeamLead && !isGuestLead && (teamScore > guestScore) }"></span>
                    </div>
                    <div class="center">:</div>
                    <div class="right">
                        <span data-bind="text: isGuestLead ? 'Вели тур' : (isGuestB == null ? '0 (Н)' : (!isGuestB ? guestScore : ((isTeamB || isTeamB == null) && isGuestB ? guestScore + ' (Б)' : '0 (Б)'))), css: { boldText: !isGuestLead && !isTeamLead && (teamScore < guestScore) }"></span>
                    </div>
                </li>
            </ul>
            <button title="Close (Esc)" type="button" class="mfp-close" data-bind="click: clearWindow">×</button>
        </div>
    </div>
	
	<div class="container" data-bind="visible: isPercentsWindowVisible" style="display: none">
		<div id="top">
            <div id="first">
                <span data-bind="text: teamName"></span>
            </div>
        </div>
		 <div id="results">
            <ul data-bind="foreach: teamPercents">
                <li>
                    <div class="tourLabel" data-bind="text: tourLabel + ':'">
                    </div>
                    <div class="left">
                        <span data-bind="text: score"></span>
                    </div>
                    <div class="center">/</div>
                    <div class="right">
						<span data-bind="text: max + ' = ' + tourPercent + '%'"></span>
					</div>
                </li>
            </ul>
			<ul>
				<li>                     
					<div class="tourLabel" data-bind="text: 'Итог:'">
                    </div>
                    <div class="left">
                        <span data-bind="text: teamPercentsTotal() + '%'"></span>
                    </div>
                    <div class="center">/</div>
                    <div class="right">
						<span data-bind="text: teamPercents().length + ' = ' + (Math.round(teamPercentsTotal() * 10 / teamPercents().length) / 10) + '%'"></span>
					</div>
				</li>
			</ul>
            <button title="Close (Esc)" type="button" class="mfp-close" data-bind="click: clearWindow">×</button>
        </div>
	</div>

    <!--<div class="placeBackground gold"> </div>
    <div class="placeBackground silver"> </div>
    <div class="placeBackground bronze"> </div>-->


    <div class="footer"><b>Спасибо:</b></div>
    <div class="footer"><a href="http://jquery.com/">jQuery</a></div>
    <div class="footer"><a href="http://knockoutjs.com/">knockout.js</a></div>
    <div class="footer"><a href="https://github.com/jsoma/tabletop">tabletop.js</a></div>
    <div class="footer" data-bind="html: firstPerson"></div>
    <div class="footer" data-bind="html: secondPerson"></div>
    <div class="footer"><a href="https://twitter.com/kennel_panic">Женя Миротин</a></div>
    <div class="footer"><a href="https://twitter.com/desert_mongoose">Лёша Гончаров</a></div>
    <div class="footer">(c) 2013</div>

</body>
</html>
