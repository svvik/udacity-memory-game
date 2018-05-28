/*
 * Create a list that holds all of your cards
 */

const initThresholdMovesDecrement = 8;

const cardState = {
    OPEN: 'open',
    MATCHED: 'matched',
    CLOSED: 'closed',
};

const cardDescriptions = [
    {
        name: "diamond",
        class: "fa fa-diamond",
    },
    {
        name: "plane",
        class: "fa fa-paper-plane-o",
    },
    {
        name: "anchor",
        class: "fa fa-anchor",
    },
    {
        name: "bolt",
        class: "fa fa-bolt",
    },
    {
        name: "cube",
        class: "fa fa-cube",
    },
    {
        name: "leaf",
        class: "fa fa-leaf",
    },
    {
        name: "bicycle",
        class: "fa fa-bicycle",
    },
    {
        name: "bomb",
        class: "fa fa-bomb",
    },
];

let moves = 0;
let secondsPassed = 0;
let cardOpenIndex = -1;
let cardOpenElement = -1;
let cardLeft = 16;

let cards = null;
let timerInterval = null;

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

function reset() {
    initCards();
    moves = 0;
    secondsPassed = 0;

    $('.time').text(secondsPassed);

    cardLeft = cards.length;
    cardOpenIndex = -1;
    cardOpenElement = null;
    $('.stars').find('i')
        .removeClass("fa-star fa-star-half-o fa-star-o")
        .addClass("fa-star");

    $('.moves').text(moves);

    $('.card>i').removeClass();
    $('.deck').children('li').each(function (index) {
        $(this).find('i').addClass(cards[index].cardDesc.class);
    });
    $('.card').removeClass('open show match');
    $('time').text(secondsPassed);

    if (timerInterval != null) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(function () {
        secondsPassed++;
        $('.time').text(secondsPassed);
    }, 1000);
}

function initCards() {
    cards = [];
    cardDescriptions.forEach(function (cardDescription) {
        cards.push({
            cardDesc: cardDescription,
            cardState: cardState.CLOSED
        });
        cards.push({
            cardDesc: cardDescription,
            cardState: cardState.CLOSED
        });
    });
    shuffle(cards);
}

function initElements() {
    for (let i = 0; i < 3; i++) {
        $('.stars').append($('<li></li>').append($('<i></i>').addClass("fa")));
    }
    for (let i = 0; i < 16; i++) {
        let $li = $('<li></li>').addClass("card");
        $li.append($('<i></i>'));
        card = $('.deck').append($li);
    }
}

function initDeck() {
    initElements();
    reset();
    $('.card').on("click", onClickFn);
    $('.restart>i').on("click", function () {
        reset();
    });
}

const onClickFn = function onClick() {
    let wi = $('.card').index($(this));
    let currentCard = cards[wi];
    if (currentCard.cardState !== cardState.CLOSED) {
        return;
    }
    if (cardOpenIndex === -1) {
        cardOpenIndex = wi;
        cardOpenElement = $(this);
        currentCard.cardState = cardState.OPEN;
        $(this).addClass('open show').animateCss('flipInY');
        return;
    }

    let openCard = cards[cardOpenIndex];
    const $openCardElement = cardOpenElement;
    const $currentCardElement = $(this);
    if (currentCard.cardDesc.name === openCard.cardDesc.name) {
        currentCard.cardState = cardState.MATCHED;
        openCard.cardState = cardState.MATCHED;
        cardLeft -= 2;
        $currentCardElement.addClass("match").animateCss('pulse');
        $openCardElement.addClass("match").animateCss('pulse');
    } else {
        openCard.cardState = cardState.CLOSED;
        $currentCardElement.addClass("open show error").animateCss('swing');
        $openCardElement.addClass("error").animateCss('swing');
    }
    setTimeout(function () {
        $currentCardElement.removeClass("open show error");
        $openCardElement.removeClass("open show error");
    }, 1250);

    cardOpenIndex = -1;
    cardOpenElement = null;
    $(".moves").text(++moves);
    if (cardLeft === 0) {
        endGame();
    } else if (moves >= initThresholdMovesDecrement && (moves - initThresholdMovesDecrement) % 4 === 0) {
        decrementStars();
    }
};

function endGame() {
    clearInterval(timerInterval);
    timerInterval = null;

    const result = saveResults();

    $(".dialog-stars").empty();
    $('.stars').find('i').each(function () {
        let $i = $('<i></i>').addClass("fa");
        if ($(this).hasClass('fa-star')) {
            $i.addClass('fa-star');
        } else if ($(this).hasClass('fa-star-half-o')) {
            $i.addClass('fa-star-half-o');
        } else if ($(this).hasClass('fa-star-o')) {
            $i.addClass('fa-star-o');
        }
        $('.dialog-stars').append($('<li></li>').append($i));
    });
    $(".dialog-win-text").text(`Congratulations! You win game in ${moves} moves and ${secondsPassed} seconds!!! Your raiting is:`);

    let bestResult = '';
    if (result !== null) {
        if (result.updated) {
            bestResult += "This is your best result!";
        } else {
            bestResult += `Your best score is for ${result.moves} moves and ${result.time} seconds.`;
        }
    }
    $(".dialog-best-result").text(bestResult);
    $("#dialog").dialog("open");
}

function saveResults() {
    if (typeof(Storage) === "undefined") {
        return null;
    }
    let bestMoves = localStorage.getItem("bestresult_moves");
    let bestTime = localStorage.getItem("bestresult_time");
    if (bestMoves === null || bestTime === null || (moves < bestMoves || (moves === bestMoves && secondsPassed < bestTime))) {
        localStorage.setItem("bestresult_moves", moves);
        localStorage.setItem("bestresult_time", secondsPassed);
        return {moves: moves, time: secondsPassed, updated: true};
    } else {
        return {moves: bestMoves, time: bestTime, updated: false};
    }
}

function decrementStars() {
    $($('.stars').children().get().reverse()).each(function () {
        let elem = $(this).find('i');
        if ($(elem).hasClass('fa-star-o')) {
            return true;
        }
        if ($(elem).hasClass('fa-star')) {
            $(elem).removeClass('fa-star').addClass('fa-star-half-o');
        } else {
            $(elem).removeClass('fa-star-half-o').addClass('fa-star-o');
        }
        return false;
    });
}

function initModal() {
    $("#dialog").dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Play again": function () {
                reset();
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}

$(function () {
    initModal();
    initDeck();
});


$.fn.extend({
    animateCss: function (animationName, callback) {
        let animationEnd = (function (el) {
            let animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
            };

            for (let t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        })(document.createElement('div'));

        this.addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);

            if (typeof callback === 'function') callback();
        });

        return this;
    },
});