/**
 * What students read and do in "AI and assessment" (lesson ID L3, shown fifth). Each list belongs
 * to the section whose first task has that ID. Wording here can change freely.
 *
 * These are Year 9 class expectations, based on the school's AI levels. They don't quote the
 * senior course's policy. Each task sheet sets the AI level, and breaches are handled under the
 * school's usual assessment procedures. Check this matches the school's position each year.
 * Marking and recording AI help are taught as ideas, with no set format yet.
 *
 * Text marks: **bold**, `file or code`, [[key on the keyboard]]. Anything can be { win, mac }.
 */
function lesson3Content_() {
  var OK = 'It\'s fine';
  var NOT_OK = 'It\'s not fine';
  var scenario = function (id, question, fine, explain) {
    return { type: 'choice', id: id, question: question, options: [OK, NOT_OK], answer: fine ? 0 : 1, explain: explain };
  };

  return {
    'L3-WHY-01': [
      { type: 'objective', text: 'By the end of this section, you can say why AI needs rules in school work.' },
      { type: 'concept', text: 'AI tools can explain ideas, find mistakes and write code. Used well, they help you learn. Used badly, they do the learning for you, and your work no longer shows what **you** can do. Assessment is how your teacher finds out what you can do, so it needs clear rules.' },
      { type: 'steps', title: 'Class poll', intro: 'Your teacher will ask these. Answer honestly: there are no wrong answers.', steps: [
        'Have you used an AI tool, such as ChatGPT, Gemini or Copilot, for school work?',
        'Did it ever give you an answer that turned out to be wrong?',
        'If AI wrote your code, could you explain how it works?'
      ] },
      { type: 'tick', task: 'L3-WHY-01' }
    ],

    'L3-LEVEL-01': [
      { type: 'objective', text: 'By the end of this section, you can say what each AI level allows.' },
      { type: 'diagram', svg: levelsDiagram_(), alt: 'Level 0, No AI: AI may not be used for this task. Level 1, Explanation only: AI may explain ideas and errors, and everything you hand in is yours. Level 2, Assisted and acknowledged: AI may contribute, if you mark it and record it.' },
      { type: 'concept', text: '**Your teacher sets the level for each task**, and the task sheet tells you which one. Being willing to acknowledge AI doesn\'t make it allowed. If the task sheet doesn\'t say, ask before you use any AI.' },
      { type: 'concept', text: 'At **Level 1**, keep a short note of what you asked AI, so you can show your teacher if asked. At **Level 2**, you also mark which parts of your work came from AI. You\'ll learn how later in this lesson.' },
      { type: 'tip', text: 'Remember VS Code\'s AI features from Lesson 3? Its grey suggestions put AI-written code straight into your work, which is only allowed at Level 2. Keep them turned off: open **Settings**, search for `chat.disableAIFeatures`, and tick it.' },
      { type: 'match', id: 'levels', prompt: 'What is the lowest level that allows each of these?', choices: ['Level 0', 'Level 1', 'Level 2'], items: [
        { text: 'Writing all your own code, using only your notes', answer: 'Level 0' },
        { text: 'Asking AI what an error message means, then fixing it yourself', answer: 'Level 1' },
        { text: 'Asking AI to explain how a loop works', answer: 'Level 1' },
        { text: 'Using a function that AI wrote, and marking it as AI-written', answer: 'Level 2' },
        { text: 'Accepting a grey suggestion in VS Code', answer: 'Level 2' },
        { text: 'Copying AI\'s explanation into your written answer', answer: 'Level 2' }
      ] },
      { type: 'tick', task: 'L3-LEVEL-01' }
    ],

    'L3-SCEN-01': [
      { type: 'objective', text: 'Decide whether each student\'s use of AI is fine. Read the explanation after each one.' },
      scenario('scen1', 'Level 0 task. Mia gets an error message she doesn\'t understand, so she asks AI what it means.', false, 'At Level 0, no AI at all, even for explanations. Mia should check her notes or ask her teacher.'),
      scenario('scen2', 'Level 1 task. Noah asks AI why his loop never stops. He reads the explanation, then fixes the loop himself and notes what he asked.', true, 'Explanations are allowed at Level 1. Everything Noah hands in is his own work.'),
      scenario('scen3', 'Level 1 task. Ava asks AI to fix her code, then pastes the fixed version into her project.', false, 'AI-written code is now in her work. That\'s only allowed at Level 2, and it would need marking.'),
      scenario('scen4', 'Level 2 task. Zara asks AI to write one function. She marks it as AI-written, records what she asked, and can explain how it works.', true, 'That\'s exactly what Level 2 asks for.'),
      scenario('scen5', 'Level 2 task. Leo has AI write most of his project and acknowledges all of it, but he can\'t explain how it works.', false, 'Acknowledging AI doesn\'t replace understanding. You must be able to explain everything you hand in.'),
      scenario('scen6', 'Level 1 task. Priya\'s friend sends her a working program, and Priya hands it in as her own.', false, 'This isn\'t about AI, but the same rules apply. Work you hand in must be yours, whoever or whatever else helped.'),
      scenario('scen7', 'Level 2 task. Sam pastes the class list, with everyone\'s full names, into a chatbot to help make a seating plan program.', false, 'Other people\'s personal information must never go into an AI tool. Sam could use made-up names instead.'),
      scenario('scen8', 'The task sheet doesn\'t give an AI level. Jack decides it must be Level 2, because he\'ll acknowledge anything AI does.', false, 'Never assume. If the level isn\'t clear, ask your teacher before using any AI.'),
      { type: 'tick', task: 'L3-SCEN-01' }
    ],

    'L3-EXPLAIN-01': [
      { type: 'objective', text: 'By the end of this section, you know what it means to understand your own work.' },
      { type: 'concept', text: 'Your teacher may ask you to explain anything you hand in, line by line. If you can\'t explain it, it isn\'t really your work, even if you typed it. This is true at every AI level.' },
      { type: 'code', text: 'scores = [7, 9, 6, 10]\ntotal = 0\nfor score in scores:\n    total = total + score\naverage = total / len(scores)\nprint("Average:", average)' },
      { type: 'steps', title: 'Explain it to a partner', steps: [
        'Read the code above on your own for one minute. You may not have learnt all of it yet. That\'s fine.',
        'Explain it to your partner, one line at a time. Say what each line does.',
        'Your partner asks you one question, such as "What would happen if the list were empty?"',
        'Swap, and have your partner explain the code below.',
        'Agree on which lines you\'d need to find out more about before you could hand this in.'
      ] },
      { type: 'code', text: 'name = input("What is your name? ")\nif len(name) > 10:\n    print("That\'s a long name!")\nelse:\n    print("Hi, " + name)' },
      { type: 'tick', task: 'L3-EXPLAIN-01' }
    ],

    'L3-ACK-01': [
      { type: 'objective', text: 'By the end of this section, you can say why AI help is acknowledged, and what that involves.' },
      { type: 'concept', text: '**Acknowledging** AI means saying exactly what it did. It\'s like referencing a book in an essay. It\'s honest, it shows your teacher what you did yourself, and it means you\'re not passing off someone else\'s work as yours.' },
      { type: 'steps', title: 'At Level 2, acknowledging means', steps: [
        '**Marking** where AI help starts and ends in your work.',
        '**Recording** which AI tool you used, what you asked it, and what you changed.',
        'Being able to **explain** the AI part, just like the rest of your work.'
      ] },
      { type: 'concept', text: 'Here\'s one way to mark AI help in Python code. Your teacher will tell you the exact format for each task.' },
      { type: 'code', text: '# AI help starts: asked AI how to find the average of a list\naverage = sum(scores) / len(scores)\n# AI help ends' },
      { type: 'tip', text: 'Later in the year you\'ll learn Git, which keeps a history of every change you make. It makes it easy to show how your work developed.' },
      { type: 'choice', id: 'ack', question: 'Why do we acknowledge AI help?', options: ['So the AI company gets credit', 'So your teacher can see what you did yourself, and you\'re being honest', 'So you\'re allowed to use AI on any task'], answer: 1, explain: 'Acknowledging is about honesty and showing your own skills. It never makes AI allowed on a task that doesn\'t allow it.' },
      { type: 'tick', task: 'L3-ACK-01' }
    ],

    'L3-CHECK-01': [
      { type: 'objective', text: 'By the end of this section, you can find mistakes in an answer from AI.' },
      { type: 'concept', text: 'AI sounds confident even when it\'s wrong. It can make up facts, get code wrong, or leave things out. Check what it says against your notes, a reliable website, or by testing the code.' },
      { type: 'concept', text: 'A student asked AI to explain the average program from earlier in this lesson. Here\'s what it said:' },
      { type: 'code', text: '1. The for loop runs once for each score in the list.\n2. len(scores) gives you the last score in the list.\n3. Dividing with / always gives a whole number.\n4. The program works even if the list is empty.\n5. print shows the average on the screen.' },
      { type: 'match', id: 'ai-check', prompt: 'Which of the AI\'s statements are correct?', choices: ['Correct', 'Wrong'], items: [
        { text: 'Statement 1, about the loop', answer: 'Correct' },
        { text: 'Statement 2, about `len(scores)`', answer: 'Wrong' },
        { text: 'Statement 3, about dividing', answer: 'Wrong' },
        { text: 'Statement 4, about an empty list', answer: 'Wrong' },
        { text: 'Statement 5, about `print`', answer: 'Correct' }
      ] },
      { type: 'tip', text: '`len` gives how many items there are, not the last one. Dividing with `/` can give a decimal, such as 8.0. An empty list would mean dividing by zero, which is an error.' },
      { type: 'tick', task: 'L3-CHECK-01' }
    ],

    'L3-PRIVACY-01': [
      { type: 'objective', text: 'By the end of this section, you know what must never go into an AI tool.' },
      { type: 'concept', text: 'What you type into an AI tool may be stored, and used to train it. Never paste in personal information, yours or anyone else\'s, or anything private to the school.' },
      { type: 'match', id: 'privacy', prompt: 'Is it safe to paste each of these into an AI tool?', choices: ['Safe', 'Not safe'], items: [
        { text: 'A general question about how loops work', answer: 'Safe' },
        { text: 'An error message from your own code', answer: 'Safe' },
        { text: 'Your password', answer: 'Not safe' },
        { text: 'Your full name, address and phone number', answer: 'Not safe' },
        { text: 'A classmate\'s assignment', answer: 'Not safe' },
        { text: 'A photo of your friends', answer: 'Not safe' },
        { text: 'The class list with everyone\'s names', answer: 'Not safe' }
      ] },
      { type: 'tip', text: 'If you need an example with names in it, make the names up.' },
      { type: 'tick', task: 'L3-PRIVACY-01' }
    ],

    'L3-QUIZ-01': [
      { type: 'objective', text: 'Check what you\'ve learnt, then agree to your responsibilities.' },
      { type: 'choice', id: 'quiz1', question: 'Who decides the AI level for a task?', options: ['You', 'Your teacher, on the task sheet', 'Whichever AI tool you use'], answer: 1, explain: 'The task sheet sets the level. If it doesn\'t say, ask.' },
      { type: 'choice', id: 'quiz2', question: 'At Level 1, which of these is allowed?', options: ['AI explains an error, and you fix it yourself', 'AI fixes your code for you', 'AI writes your comments'], answer: 0, explain: 'At Level 1, AI may explain, but everything you hand in is yours.' },
      { type: 'choice', id: 'quiz3', question: 'You used AI at Level 2 and acknowledged it. Your teacher asks how that part works. What should you be able to do?', options: ['Say that AI wrote it', 'Explain how it works', 'Nothing, because you acknowledged it'], answer: 1, explain: 'You must be able to explain everything you hand in, including any AI part.' },
      { type: 'choice', id: 'quiz4', question: 'AI gives you an answer that sounds very sure. What should you do?', options: ['Trust it, because it sounds sure', 'Check it against your notes, a reliable source, or by testing it', 'Ask the same AI if it\'s sure'], answer: 1, explain: 'AI can be confidently wrong. Always check.' },
      { type: 'choice', id: 'quiz5', question: 'Which is safe to paste into an AI tool?', options: ['A classmate\'s code', 'Your own error message', 'Your login details'], answer: 1, explain: 'Keep anyone\'s personal information and work out of AI tools.' },
      { type: 'tick', task: 'L3-QUIZ-01' },
      { type: 'steps', title: 'My responsibilities', intro: 'Read these carefully. Ticking the box below means you agree to them.', steps: [
        'I will check the AI level for every task, and ask if it isn\'t clear.',
        'At Level 0, I won\'t use AI, including VS Code\'s AI features.',
        'At Level 1, AI may explain things, but everything I hand in is my own work. I\'ll keep a note of what I asked.',
        'At Level 2, I\'ll mark and record any AI help.',
        'I will be able to explain everything I hand in.',
        'I will check AI\'s answers before I trust them.',
        'I will keep personal information out of AI tools.',
        'I understand that breaking these rules is handled like any other assessment problem, under the school\'s usual procedures.'
      ] },
      { type: 'tick', task: 'L3-AGREE-01' }
    ],

    'L3-EXTRA-01': [
      { type: 'objective', text: 'Finished early? Fact-check an AI. This doesn\'t count towards your progress.' },
      { type: 'tip', text: 'Only use an AI tool for this if your teacher says you may. Otherwise, use the AI answer from **Check AI\'s answers**.' },
      { type: 'steps', title: 'Fact-check it', steps: [
        'Choose a topic you know well, such as a sport, a book or a subject you\'re good at.',
        'Ask an AI tool three questions about it, and write down its answers.',
        'Check each answer against a reliable source, such as your textbook or an official website.',
        'Write down anything it got wrong or left out, and where you found the right answer.',
        'Be ready to share one mistake with the class.'
      ] }
    ]
  };
}
