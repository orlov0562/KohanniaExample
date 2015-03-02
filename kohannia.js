var alphabets = {
    'ua': ['йцукенгшщзхї', 'фівапролджє','ячсмитьбюґ'],
    'ru': ['йцукенгшщзхъ', 'фывапролджэ','ячсмитьбюё']
}

var questionsBase = {
    'ua': {
        '1': {
            'question': 'Як називається найперша якість праведного кохання? У слові 8 букв. Моральна стійкість у звабленні красою, грошима, владою. Зберігається силою духа. Коли дух слабкий, то душа зваблюється принадами і зраджує!',
            'answer': 'вірність',
        },

        '2': {
            'question': 'Якість душі, коли людина заради ближнього готова віддати своє життя.',
            'answer': 'жертовність',
        },

        '3': {
            'question': 'Надзвичайна витримка у випробуваннях, зневага до болю та несправедливості заради коханої людини.',
            'answer': 'терпеливість',
        }
    },
    'ru': {
        '1': {
            'question': 'Как называется самая качество праведного любовь? В слове 8 букв. Моральная устойчивость в соблазнении красотой, деньгами, властью. Сохраняется силой духа. Когда дух слаб, то душа соблазняется прелестями и изменяет!',
            'answer': 'верность',
        },

        '2': {
            'question': 'Качество души, когда человек ради ближнего готова отдать свою жизнь.',
            'answer': 'жертвенность',
        },

        '3': {
            'question': 'Чрезвычайная выдержка в испытаниях, пренебрежение к боли и несправедливости ради любимого человека.',
            'answer': 'терпение',
        }
    }

};

var translateBase = {
    'ua': {
        'round_ended': 'Цей раунд закінчений, тисни "Наступний раунд"',
        'game_over': 'У мене закінчилися питання, ти переміг!',
        'next_round': 'Наступний раунд',
        'round': 'Раунд',
        'game_state': 'Стан гри',
        'round_complete': 'Раунд завершено',
        'round_lasts': 'Триває',
        'round_time_sec': 'Час раунду, сек',
        'correct_answers': 'Правильних літер',
        'incorrect_answers': 'Помилок',
        'start_game': 'Почати гру українською'
    },

    'ru': {
        'round_ended': 'Раунд законче, жми "Следующий раунд"',
        'game_over': 'У меня закончились вопросы, ты выйграл!',
        'next_round': 'Следующий раунд',
        'round': 'Раунд',
        'game_state': 'Состояние игры',
        'round_complete': 'Раунд завершен',
        'round_lasts': 'Продолжается',
        'round_time_sec': 'Время раунда, сек',
        'correct_answers': 'Правильных букв',
        'incorrect_answers': 'Ошибок',
        'start_game': 'Начать игру на русском'
    }
}

var round, question, timeInSec, timer, errorsCount, roundComplete, useAlphabet=null;

function start(lang) {
    if ( !alphabets.hasOwnProperty(lang)
        || !questionsBase.hasOwnProperty(lang)
        || !translateBase.hasOwnProperty(lang)
    ) {
        showSelectLanguageDialogue();
        return;
    }
    useAlphabet = lang;
    $('#lang').slideUp(100, function(){$('#game').slideDown('100');});

    drawRound(1);
}

function showSelectLanguageDialogue() {
    $('#lang').html('');
    $('#lang').append($('<input/>').attr({
                type: 'button',
                value: __('start_game', 'ua'),
                onclick: 'start("ua")'
    }));

    $('#lang').append('&nbsp;');

    $('#lang').append($('<input/>').attr({
                type: 'button',
                value: __('start_game', 'ru'),
                onclick: 'start("ru")'
    }));

}

function drawRound(roundId) {
    round = roundId;
    reset();
    loadQuestion(round);
    drawKeyboard();
    startTimer();
    updateStat();
}

function reset() {
    question = null;
    timeInSec = 0;
    timer = null;
    roundComplete = false;
    $('#keyboard').html('');
    $('#question').html('');
    $('#answer').html('');
    $('#stat').html('');
    $('#navigation').html('');
}

function loadQuestion(questionId) {
    question = questionsBase[useAlphabet][questionId];
    $('#question').html(question['question']);
    for (var i=0; i<question['answer'].length; i++) {
        $('#answer').append($('<div>?</div>'))
    }
}

function drawKeyboard() {
    var keyboard = $('#keyboard');
    var alphabet = alphabets[useAlphabet];
    for (var l=0; l<alphabet.length; l++) {
        var buttons = $('<div></div>');
        for (var i=0; i<alphabet[l].length; i++) {
            var btnChar = alphabet[l].charAt(i);
            var button = $('<input/>').attr({
                type: 'button',
                value: btnChar,
                onclick: 'keyboardEvent(this)'
            });
            buttons.append(button);
        }
        keyboard.append(buttons);
    }
}

function __(key, alphabet) {
    var a = (typeof alphabet == 'undefined' ? useAlphabet : alphabet);
    return translateBase[a][key];
}

function keyboardEvent(obj) {
    if (roundComplete) { alert(__('round_ended')); return; }

    var btn = $(obj);
    if (btn.attr('class')) return;

    var ch = btn.val();

    if (question['answer'].indexOf(ch)<0) {
        btn.addClass('err');
    } else {
        btn.addClass('right');
        var allOccuranceInd = indexesOf(question['answer'], ch);
        allOccuranceInd.forEach(function(item, i, arr){
            var card = $('#answer').children('div').eq(item);
            card.html(ch);
            card.addClass('ok');
        });
        roundComplete = isRoundComplete();
        if (roundComplete) {
            stopTimer();
            showNextRoundBtn();
        }
    }
    updateStat();
}

function showNextRoundBtn(){
    if (!questionsBase[useAlphabet].hasOwnProperty(round+1)) {
        $('#navigation').html(__('game_over'));
        return;
    }
    $('#navigation').append($('<input/>').attr({
        type: 'button',
        value: __('next_round'),
        onclick: 'drawRound('+(round+1)+')'
    }));
}

function isRoundComplete() {
    return $('#answer div:contains(\'?\')').length == 0;
}

function indexesOf(source, find) {
  var result = [];
  for(var i=0; i<source.length; ++i) {
    if (source.substring(i, i + find.length) == find) {
      result.push(i);
    }
  }
  return result;
}

function startTimer() {
    timer = setInterval(function(){
        timeInSec += 1;
        updateStat();
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function updateStat() {
    var stat = '';
    stat += '<ul>';
    stat +='<li><strong>'+__('round')+'</strong>: '+round+'</li>';
    stat +='<li><strong>'+__('game_state')+'</strong>: '+(roundComplete ? __('round_complete') : __('round_lasts'))+'</li>';
    stat +='<li><strong>'+__('round_time_sec')+'</strong>: '+timeInSec+'</li>';
    stat +='<li><strong>'+__('correct_answers')+'</strong>: '+($("#answer div").length - $('#answer div:contains(\'?\')').length)+'</li>';
    stat +='<li><strong>'+__('incorrect_answers')+'</strong>: '+$("#keyboard input.err").length+'</li>';
    stat += '</ul>';
    $('#stat').html(stat);
}

$().ready(function(){
    start();
});
