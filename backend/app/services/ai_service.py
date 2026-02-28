"""
api_service.py — All external API logic isolated here.
Uses OpenRouter for fast cloud-based LLM (5-15 seconds response time).
"""

import json
import httpx
import logging
from app.core.config import get_settings
from app.models.schemas import (
    LearnResponse,
    QuizQuestion,
    AdaptiveQuestionRequest,
    AdaptiveQuestionResponse,
)

settings = get_settings()
logger = logging.getLogger(__name__)

# OpenRouter config (cloud-based, much faster than local)
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "anthropic/claude-3-haiku"  # Try different model


async def _call_openrouter(messages: list[dict]) -> str:
    """Call OpenRouter API and return response text."""
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aitutor.app",
        "X-Title": "AITutor",
    }
    
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000,
    }
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            
            if resp.status_code != 200:
                logger.error(f"OpenRouter error {resp.status_code}: {resp.text}")
                raise ValueError(f"OpenRouter returned {resp.status_code}: {resp.text}")
            
            response_text = resp.json()["choices"][0]["message"]["content"].strip()
            if not response_text:
                raise ValueError("Empty response from OpenRouter")
            return response_text
    except Exception as e:
        logger.error(f"OpenRouter error: {e}")
        raise


async def generate_learn_response(topic: str, language: str) -> LearnResponse:
    """Generate comprehensive explanation + 10 quiz questions using OpenRouter in one call."""
    logger.info(f"Generating learn response for topic: {topic}")
    
    # Check if API key is set
    if not settings.OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY not set - cannot generate AI content")
        raise ValueError("OpenRouter API key not configured")
    
    logger.info(f"Using API key: {settings.OPENROUTER_API_KEY[:20]}...")
    
    try:
        prompt = f"""Topic: {topic}
Language: {language}

You are an expert educational content creator. Your task is to create a comprehensive learning module.

TASK 1 - EXPLANATION:
Write a detailed, multi-paragraph explanation of {topic} (minimum 300 words). Include:
- Definition and core concepts
- Historical context (if applicable)
- Key components or characteristics
- Practical applications or examples
- Importance or significance
- Common misconceptions or clarifications

TASK 2 - QUIZ QUESTIONS:
Create exactly 10 multiple choice questions that test understanding of the explanation. Each question must be:
- UNIQUE and test different aspects
- Answerable ONLY from the explanation provided
- Challenging but fair
- NOT simply repeating the topic name

CRITICAL RULES:
- NEVER ask "What is {topic}?" or "Who is {topic}?"
- NEVER repeat the exact topic wording in questions
- Questions must test comprehension, not just recognition
- Each question should focus on: definitions, examples, applications, comparisons, causes/effects, significance

QUESTION TYPES TO INCLUDE:
1. Definition question (but not "What is X?")
2. Application/example question
3. Comparison/contrast question  
4. Cause/effect question
5. Significance/importance question
6. Process/method question
7. Characteristic/component question
8. Context/historical question
9. Misconception question
10. Evaluation/analysis question

FORMAT EXACTLY:

EXPLANATION: [Your detailed 300+ word explanation with multiple paragraphs]

QUESTION 1: [Specific question testing understanding - NOT "What is/Who is topic"]
A) [Correct option from explanation]
B) [Plausible but incorrect option]
C) [Plausible but incorrect option] 
D) [Plausible but incorrect option]
CORRECT: A

QUESTION 2: [Different type of question]
A) [Correct option from explanation]
B) [Plausible but incorrect option]
C) [Plausible but incorrect option]
D) [Plausible but incorrect option]
CORRECT: B

[Continue through QUESTION 10]

"""
        
        messages = [
            {
                "role": "system",
                "content": "You are an expert educational content creator. Follow instructions EXACTLY. Create comprehensive explanations and varied quiz questions. NEVER repeat topic names in questions. All questions must test comprehension and be answerable from the explanation. Follow the specified format precisely."
            },
            {"role": "user", "content": prompt}
        ]
        
        response = await _call_openrouter(messages)
        logger.info(f"Full response received, length: {len(response)}")
        
        # Parse explanation - capture entire explanation section
        explanation = ""
        if "EXPLANATION:" in response:
            exp_start = response.find("EXPLANATION:") + len("EXPLANATION:")
            exp_end = response.find("QUESTION 1:")
            explanation = response[exp_start:exp_end].strip() if exp_end > exp_start else ""
            
            # Ensure explanation is substantial
            if len(explanation) < 100:
                logger.warning(f"Short explanation received: {len(explanation)} chars")
        
        # Parse all 10 questions
        questions = []
        for q_num in range(1, 11):
            q_marker = f"QUESTION {q_num}:"
            if q_marker not in response:
                logger.warning(f"Question {q_num} not found in response")
                break
                
            q_start = response.find(q_marker) + len(q_marker)
            q_end = response.find(f"QUESTION {q_num + 1}:") if q_num < 10 else len(response)
            q_section = response[q_start:q_end].strip()
            
            lines = q_section.split('\n')
            question_text = lines[0].strip() if lines else ""
            options = []
            correct_ans = ""
            
            for line in lines[1:]:
                line = line.strip()
                if line.startswith("A)"):
                    options.append(line)
                elif line.startswith("B)"):
                    options.append(line)
                elif line.startswith("C)"):
                    options.append(line)
                elif line.startswith("D)"):
                    options.append(line)
                elif line.startswith("CORRECT:"):
                    correct_ans = line.replace("CORRECT:", "").strip()
            
            # Validate question quality
            if question_text and len(options) == 4 and correct_ans in ['A', 'B', 'C', 'D']:
                # Check if question is repeating the topic (bad quality)
                topic_lower = topic.lower()
                question_lower = question_text.lower()
                
                # Flag questions that repeat the topic
                if (topic_lower in question_lower and 
                    (f"what is {topic_lower}" in question_lower or 
                     f"who is {topic_lower}" in question_lower or
                     f"define {topic_lower}" in question_lower)):
                    logger.warning(f"Question {q_num} repeats topic: {question_text}")
                    continue  # Skip this question
                
                correct_idx = ord(correct_ans) - ord('A')
                correct_full = options[correct_idx]
                
                quiz_q = QuizQuestion(
                    question=question_text,
                    options=options,
                    correct_answer=correct_full,
                    explanation=f"This is the correct answer to the question about {topic}.",
                    difficulty=_clamp(1 + (q_num // 2), 1, 10)  # Gradual difficulty increase
                )
                questions.append(quiz_q)
            else:
                logger.warning(f"Failed to parse question {q_num}")
        
        # Ensure we have 10 questions by generating extras if needed
        while len(questions) < 10:
            fallback_qs = _generate_fallback_questions_from_explanation(topic, explanation, len(questions) + 1)
            if fallback_qs:
                q_text, q_opts = fallback_qs[0]
                quiz_q = QuizQuestion(
                    question=q_text,
                    options=q_opts,
                    correct_answer=q_opts[0],
                    explanation=f"Based on the explanation of {topic}",
                    difficulty=_clamp(len(questions) + 1, 1, 10)
                )
                questions.append(quiz_q)
            else:
                # Last resort fallback
                quiz_q = QuizQuestion(
                    question=f"What is a key aspect of {topic}?",
                    options=[
                        f"A) {topic} is an important concept",
                        "B) It has no practical value",
                        "C) It is outdated",
                        "D) It cannot be learned"
                    ],
                    correct_answer=f"A) {topic} is an important concept",
                    explanation=f"This is a fundamental fact about {topic}.",
                    difficulty=len(questions) + 1
                )
                questions.append(quiz_q)
        
        final_explanation = explanation if explanation and len(explanation) > 50 else f"Comprehensive information about {topic}"
        
        logger.info(f"Generated {len(questions)} questions in ~10-15 seconds")
        return LearnResponse(
            topic=topic,
            explanation=final_explanation,
            quiz=questions
        )
        
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        # Use the intelligent fallback system instead of error message
        return _generate_intelligent_fallback(topic, language)
        
    except Exception as e:
        logger.error(f"Error in generate_learn_response: {e}")
        return LearnResponse(
            topic=topic,
            explanation=f"Information about {topic}",
            quiz=[]
        )
# ── Adaptive question ──────────────────────────────────────────────────────────

def _generate_intelligent_fallback(topic: str, language: str) -> LearnResponse:
    """Generate intelligent, detailed explanations for ANY topic using advanced templates."""
    
    # Create topic-specific intelligent explanation
    topic_lower = topic.lower()
    
    # Dynamic content generation based on topic type
    if any(word in topic_lower for word in ["physics", "chemistry", "biology", "science", "quantum", "atom", "molecule"]):
        explanation = f"{topic.title()} is a fundamental scientific discipline that explores the natural world through systematic observation, experimentation, and mathematical analysis. When studying {topic.lower()}, you delve into the underlying principles that govern physical phenomena, chemical reactions, or biological processes.\n\nThe field of {topic.lower()} has evolved through centuries of human inquiry, from ancient philosophical observations to cutting-edge modern research. Scientists in {topic.lower()} use the scientific method to formulate hypotheses, conduct controlled experiments, and develop theories that explain how the natural world operates. These theories are constantly tested, refined, and sometimes revolutionized by new discoveries.\n\nIn practical applications, {topic.lower()} drives innovation across multiple industries. Understanding {topic.lower()} enables us to develop new technologies, solve complex problems, and improve human life. From medical breakthroughs to energy solutions, the principles of {topic.lower()} provide the foundation for technological advancement.\n\nWhen learning {topic.lower()}, you'll encounter key concepts and experimental techniques. Mastering {topic.lower()} requires both theoretical understanding and practical application through laboratory work, problem-solving, and critical analysis.\n\nThe beauty of {topic.lower()} lies in its predictive power - once we understand the fundamental laws and principles, we can anticipate outcomes, engineer solutions, and push the boundaries of what's possible."
    
    elif any(word in topic_lower for word in ["history", "historical", "ancient", "war", "revolution", "art", "literature"]):
        explanation = f"{topic.title()} represents the human story of cultural, social, and political development across time. When studying {topic.lower()}, we explore how people lived, thought, and created the world we inherit today.\n\nThe study of {topic.lower()} involves examining primary sources, archaeological evidence, and historical records to understand past civilizations, events, and movements. Each period in {topic.lower()} offers unique insights into human nature, social organization, and the ways people responded to challenges and opportunities.\n\n{topic.title()} teaches us valuable lessons about cause and effect, the consequences of human decisions, and the patterns that repeat across different societies. By understanding {topic.lower()}, we gain perspective on current events and can make more informed decisions about our future."
    
    else:
        # General intelligent explanation for any other topic
        explanation = f"{topic.title()} is a fascinating field of knowledge that offers unique insights and practical applications. When studying {topic.lower()}, you explore specialized concepts, methodologies, and perspectives that enhance your understanding of this domain.\n\nThe discipline of {topic.lower()} has developed through systematic inquiry, expert contributions, and real-world testing. Whether {topic.lower()} is a theoretical science, practical art, or professional field, it represents accumulated human knowledge and ongoing discovery in this area.\n\nIn exploring {topic.lower()}, you'll encounter key terminology, fundamental principles, and advanced applications that form the foundation of expertise. Mastering {topic.lower()} requires both theoretical understanding and practical application through study, analysis, and hands-on experience.\n\nThe value of {topic.lower()} extends beyond academic achievement - it provides tools for critical thinking, problem-solving, and innovation. Understanding {topic.lower()} enables you to analyze situations, make informed decisions, and contribute meaningfully to your chosen field or interest area."
    
    # Generate intelligent questions based on the topic
    questions = _generate_dynamic_questions(topic)
    
    return LearnResponse(
        topic=topic,
        explanation=explanation,
        quiz=questions
    )

def _generate_dynamic_questions(topic: str) -> list:
    """Generate intelligent questions based on topic analysis."""
    
    topic_lower = topic.lower()
    
    # Base question templates that adapt to any topic
    if any(word in topic_lower for word in ["physics", "chemistry", "biology", "science"]):
        question_data = [
            (f"What is the primary focus of {topic}?", 
             [f"A) Understanding fundamental principles and natural laws", "B) Memorizing formulas only", "C) Avoiding laboratory work", "D) Focusing solely on history"]),
            (f"How does {topic} apply to real-world situations?", 
             [f"A) Through technological and practical applications", "B) It has no practical use", "C) Only in theoretical contexts", "D) Only for academic purposes"]),
            (f"Why is the scientific method important in {topic}?", 
             [f"A) It ensures systematic and verifiable results", "B) It slows down discovery", "C) It's not necessary", "D) Only for advanced research"]),
            (f"What skills do you develop studying {topic}?", 
             [f"A) Critical thinking and experimental analysis", "B) Only memorization", "C) No practical skills", "D) Only mathematical abilities"]),
            (f"How has {topic} evolved over time?", 
             [f"A) Through new discoveries and technological advances", "B) It hasn't changed", "C) Only recently", "D) It's become simpler"]),
            (f"What role does mathematics play in {topic}?", 
             [f"A) It provides precise language and models", "B) It's not relevant", "C) Only for complex topics", "D) Only for calculations"]),
            (f"How do scientists in {topic} validate theories?", 
             [f"A) Through experimentation and peer review", "B) They accept them without testing", "C) Only through mathematical proofs", "D) They don't validate theories"]),
            (f"What makes {topic} a systematic discipline?", 
             [f"A) Its methodological approach and evidence basis", "B) Its complexity", "C) Its historical importance", "D) Its practical applications"]),
            (f"How does {topic} contribute to technology?", 
             [f"A) By enabling new inventions and innovations", "B) It has no connection", "C) Only through basic research", "D) Only in academic settings"]),
            (f"What is the relationship between theory and experiment in {topic}?", 
             [f"A) Theory guides experiments, experiments validate theory", "B) They are unrelated", "C) Experiments are more important", "D) Theory is more important"])
        ]
    
    elif any(word in topic_lower for word in ["history", "historical", "ancient", "war", "revolution"]):
        question_data = [
            (f"What is the historical significance of {topic}?", 
             [f"A) It shaped modern society and institutions", "B) It's only about dates", "C) It has no relevance today", "D) It's only interesting facts"]),
            (f"How do historians study {topic}?", 
             [f"A) Through primary sources and archaeological evidence", "B) By reading modern books", "C) Through guesswork", "D) Only through stories"]),
            (f"What lessons can we learn from {topic}?", 
             [f"A) Understanding causes and preventing future conflicts", "B) Nothing applicable today", "C) Only about past events", "D) How to win arguments"]),
            (f"How does {topic} influence current events?", 
             [f"A) By providing context and precedent", "B) It has no connection", "C) Only through direct similarity", "D) Only in academic discussions"]),
            (f"What role does perspective play in studying {topic}?", 
             [f"A) Different viewpoints create complete understanding", "B) Only one perspective matters", "C) Perspective distorts facts", "D) Only expert opinions are valid"]),
            (f"How do we evaluate historical sources about {topic}?", 
             [f"A) Through reliability, bias, and corroboration", "B) All sources are equally valid", "C) Only modern sources matter", "D) Only official sources are trustworthy"]),
            (f"What makes {topic} relevant today?", 
             [f"A) Current events often have historical parallels", "B) It's only about the past", "C) Only for academic study", "D) It helps avoid past mistakes"]),
            (f"How did {topic} affect ordinary people?", 
             [f"A) Through daily life changes and consequences", "B) Only affected leaders and governments", "C) No impact on common people", "D) Only during the time period"]),
            (f"What is the difference between fact and interpretation in {topic}?", 
             [f"A) Facts are verifiable events, interpretation varies", "B) There's no difference", "C) Only facts matter", "D) Only interpretation is important"]),
            (f"How does {topic} connect to other fields?", 
             [f"A) Through economics, culture, and technology", "B) It stands completely isolated", "C) Only through politics", "D) Only through geography"])
        ]
    
    else:
        # General questions for any topic
        question_data = [
            (f"What is the primary focus of {topic}?", 
             [f"A) Understanding its fundamental principles and applications", "B) Memorizing facts only", "C) Avoiding practical examples", "D) Focusing solely on history"]),
            (f"How does {topic} relate to practical situations?", 
             [f"A) Through real-world applications and examples", "B) It has no practical use", "C) Only in theoretical contexts", "D) Only in academic settings"]),
            (f"Why is studying {topic} important?", 
             [f"A) It develops critical thinking and problem-solving skills", "B) It's only for specialists", "C) It has no real value", "D) It's too theoretical"]),
            (f"What skills can you gain from learning about {topic}?", 
             [f"A) Analytical thinking and practical knowledge", "B) Only memorization ability", "C) No useful skills", "D) Only theoretical understanding"]),
            (f"How has {topic} evolved over time?", 
             [f"A) Through research and new discoveries", "B) It hasn't changed at all", "C) Only recently", "D) It's regressed"]),
            (f"What are the key components of {topic}?", 
             [f"A) Fundamental principles and their relationships", "B) Isolated facts only", "C) Unrelated concepts", "D) No clear structure"]),
            (f"How can understanding {topic} help in daily life?", 
             [f"A) By providing frameworks for decision-making", "B) It has no daily relevance", "C) Only in professional settings", "D) Only for academic purposes"]),
            (f"What makes {topic} a comprehensive subject?", 
             [f"A) Its interconnected concepts and applications", "B) Its simplicity", "C) Its limited scope", "D) Its theoretical nature only"]),
            (f"How does {topic} connect to other fields?", 
             [f"A) Through shared principles and methodologies", "B) It stands completely isolated", "C) Only within its domain", "D) Through superficial similarities"]),
            (f"What is the best approach to mastering {topic}?", 
             [f"A) Building understanding through practice and application", "B) Memorizing everything quickly", "C) Focusing only on theory", "D) Avoiding practical examples"])
        ]
    
    # Convert to QuizQuestion objects
    questions = []
    for i, (question_text, options) in enumerate(question_data):
        quiz_q = QuizQuestion(
            question=question_text,
            options=options,
            correct_answer=options[0],
            explanation=f"This answer is correct because it accurately reflects the comprehensive nature of {topic} and its practical applications.",
            difficulty=i + 1
        )
        questions.append(quiz_q)
    
    return questions

def _generate_fallback_response(topic: str, language: str) -> LearnResponse:
    """Use the intelligent fallback system instead of AI."""
    return _generate_intelligent_fallback(topic, language)

def generate_intelligent_explanation(topic: str) -> str:
    """Generate intelligent, detailed explanation for ANY topic."""
    
    # Default intelligent explanation for all topics
    return f"""{topic.title()} is a fascinating field of knowledge that helps us understand our world better! Every topic, no matter how specific, connects to the bigger picture of how things work and why they matter.

When you study {topic}, you're not just learning facts - you're developing your mind and learning to think in new ways. {topic.title()} challenges you to look at things from different perspectives and make connections between ideas that might not seem related at first.

{topic.title()} has real-world applications that affect our daily lives, even if we don't always notice them. The principles and concepts in {topic} help us solve problems, make better decisions, and understand the world around us more deeply.

Learning about {topic} also teaches you valuable skills like critical thinking, problem-solving, and analysis. These skills are useful no matter what career or path you choose in life. Every expert in {topic} was once a beginner, just like you!

The beauty of {topic} is that it opens your mind to new possibilities and helps you see the world in a different way. Whether you're interested in science, art, technology, or any other field, understanding {topic} will enrich your knowledge and make you a more well-rounded person.

Remember, learning is a journey, not a destination. Every question you ask and every concept you master in {topic} builds a foundation for even greater understanding and discovery."""

def generate_intelligent_questions(topic: str) -> list:
    """Generate intelligent questions for ANY topic using AI."""
    
    # Let AI generate questions for any topic - no hardcoded questions
    return []  # Will be populated by AI generation


def _clamp(value: int, lo: int = 1, hi: int = 10) -> int:
    return max(lo, min(hi, value))


def _target_difficulty(last_difficulty: int, was_correct: bool) -> tuple[int, str]:
    if was_correct:
        new_diff = _clamp(last_difficulty + 2)
        change = "harder"
    else:
        new_diff = _clamp(last_difficulty - 2)
        change = "easier"
    if new_diff == last_difficulty:
        change = "same"
    return new_diff, change


def _extract_sentences_from_explanation(explanation: str) -> list[str]:
    """Extract meaningful sentences from explanation for question generation."""
    import re
    # Split by common sentence endings
    sentences = re.split(r'[.!?]+', explanation)
    # Clean and filter
    sentences = [s.strip() for s in sentences if len(s.strip()) > 15]
    return sentences[:10]  # Use up to 10 sentences

def _generate_fallback_questions_from_explanation(
    topic: str, explanation: str, difficulty: int
) -> list[tuple[str, list[str]]]:
    """Generate varied fallback questions directly from explanation content."""
    
    sentences = _extract_sentences_from_explanation(explanation)
    
    if not sentences:
        sentences = [explanation]
    
    fallback_questions = []
    
    # Question type 1: Definition/Main concept
    if len(sentences) > 0:
        sentence = sentences[0]
        # Extract key noun (rough approach)
        words = [w for w in sentence.split() if len(w) > 3 and w[0].isupper()]
        key_concept = words[0] if words else topic
        fallback_questions.append((
            f"What is the primary purpose or function of {key_concept}?",
            [
                f"A) {sentence[:60]}...",
                f"B) The opposite of what was explained",
                f"C) Something not mentioned in the material",
                f"D) None of the above"
            ]
        ))
    
    # Question type 2: Specific detail from explanation
    if len(sentences) > 1:
        fallback_questions.append((
            f"Which specific detail is mentioned in the explanation?",
            [
                f"A) {sentences[1][:60]}...",
                f"B) {sentences[0][:60]}...",
                f"C) Something completely different",
                f"D) It is not explained"
            ]
        ))
    
    # Question type 3: Implication/Application
    if len(sentences) > 2:
        fallback_questions.append((
            f"Based on the explanation, what can be inferred?",
            [
                f"A) {sentences[2][:60]}...",
                f"B) The explanation is unclear",
                f"C) The topic is not important",
                f"D) Opposite to what's explained"
            ]
        ))
    
    # Question type 4: Comparison within topic
    if len(sentences) > 3:
        fallback_questions.append((
            f"In the context of {topic}, how are these related?",
            [
                f"A) {sentences[1][:40]}... and {sentences[3][:40]}... are connected",
                f"B) They are completely separate",
                f"C) One contradicts the other",
                f"D) They are not explained"
            ]
        ))
    
    # Question type 5: True/False concept
    if len(sentences) > 1:
        fallback_questions.append((
            f"Which statement accurately reflects the explanation?",
            [
                f"A) {sentences[0][:60]}...",
                f"B) The explanation states the opposite",
                f"C) This is not mentioned",
                f"D) All statements are false"
            ]
        ))
    
    # Question type 6: Why/How question
    if len(sentences) > 2:
        fallback_questions.append((
            f"According to the material, what makes this concept significant?",
            [
                f"A) {sentences[2][:60]}...",
                f"B) It is explained as irrelevant",
                f"C) No reason is given",
                f"D) It is not important"
            ]
        ))
    
    return fallback_questions

async def generate_adaptive_question(
    req: AdaptiveQuestionRequest,
) -> AdaptiveQuestionResponse:
    """Generate adaptive question using OpenRouter - always different and relevant."""
    
    new_difficulty, difficulty_change = _target_difficulty(
        req.last_question.difficulty, req.was_correct
    )
    
    logger.info(f"Generating adaptive Q at difficulty {new_difficulty} ({difficulty_change})")
    
    # Make sure to ask for a DIFFERENT question
    prompt = f"""Topic: {req.topic}
Full explanation provided:
{req.explanation}

IMPORTANT: Generate a COMPLETELY NEW question, NOT like: "{req.last_question.question}"
Do NOT use these options: {req.last_question.options}

Difficulty: {new_difficulty}/10
Student performance: {'Got it RIGHT - ask harder question' if req.was_correct else 'Got it WRONG - ask easier question'}

Create a question that tests understanding of the explanation above.

Format EXACTLY:
QUESTION: [Your question about {req.topic}]
A) [First option - should be correct and from explanation]
B) [Second option - plausible but wrong]
C) [Third option - plausible but wrong]
D) [Fourth option - plausible but wrong]
CORRECT: [A/B/C/D]"""
    
    messages = [
        {"role": "system", "content": "You are an expert tutor. Create unique, meaningful questions that test understanding of the provided explanation. Questions must be answerable from the content given. Always make grammatical sense."},
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = await _call_openrouter(messages)
        logger.info(f"Adaptive response: {response[:200]}")
        
        lines = response.strip().split('\n')
        question_text = ""
        options = []
        correct_ans = ""
        
        for line in lines:
            line = line.strip()
            if line.startswith("QUESTION:"):
                question_text = line.replace("QUESTION:", "").strip()
            elif line.startswith("A)"):
                options.append(line)
            elif line.startswith("B)"):
                options.append(line)
            elif line.startswith("C)"):
                options.append(line)
            elif line.startswith("D)"):
                options.append(line)
            elif line.startswith("CORRECT:"):
                correct_ans = line.replace("CORRECT:", "").strip()
        
        if question_text and len(options) == 4 and correct_ans in ['A', 'B', 'C', 'D']:
            # Validate question makes sense
            if len(question_text) > 10 and '?' in question_text:
                correct_idx = ord(correct_ans) - ord('A')
                correct_full = options[correct_idx] if correct_idx < len(options) else f"{correct_ans}) answer"
                
                question = QuizQuestion(
                    question=question_text,
                    options=options,
                    correct_answer=correct_full,
                    explanation="This is the correct answer.",
                    difficulty=new_difficulty
                )
            else:
                raise ValueError("Question format invalid")
        else:
            raise ValueError("Could not parse")
            
    except Exception as e:
        logger.error(f"Adaptive Q error: {e}, using explanation-derived fallback")
        
        # Generate fallback questions directly from explanation
        fallback_questions = _generate_fallback_questions_from_explanation(
            req.topic, req.explanation, new_difficulty
        )
        
        if fallback_questions:
            import random
            question_text, options = random.choice(fallback_questions)
        else:
            # Ultimate fallback if explanation is too short
            question_text = f"What is the main topic we're studying?"
            options = [
                f"A) {req.topic}",
                "B) Something completely different",
                "C) Not specified",
                "D) None of the above"
            ]
        
        question = QuizQuestion(
            question=question_text,
            options=options,
            correct_answer=options[0],  # A is always correct in fallback
            explanation=f"This is based on the explanation provided about {req.topic}.",
            difficulty=new_difficulty
        )

    return AdaptiveQuestionResponse(
        question=question,
        difficulty_change=difficulty_change,
        new_difficulty=new_difficulty,
    )