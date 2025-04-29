import { type LessonContent } from '@/schema/lesson';
import { VideoEmbed } from './VideoEmbed';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface LessonContentProps {
  content: LessonContent;
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="space-y-8">
      {content.map((block, index) => {
        switch (block.type) {
          case 'video':
            return (
              <VideoEmbed
                key={index}
                id={block.id}
                title={block.title}
                description={block.description}
                timestamp={block.timestamp}
                params={block.params}
              />
            );
          
          case 'text':
            return (
              <Card key={index} className="p-6">
                {block.title && (
                  <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
                )}
                <div className="prose dark:prose-invert max-w-none">
                  {block.content}
                </div>
              </Card>
            );
          
          case 'quiz':
            return <QuizBlock key={index} quiz={block} />;
        }
      })}
    </div>
  );
}

function QuizBlock({ quiz }: { quiz: Extract<LessonContent[number], { type: 'quiz' }> }) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(quiz.questions.length).fill(-1)
  );
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
      {quiz.description && (
        <p className="text-muted-foreground mb-6">{quiz.description}</p>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        {quiz.questions.map((question, qIndex) => (
          <AccordionItem key={qIndex} value={`q-${qIndex}`}>
            <AccordionTrigger className="text-left">
              <span className="font-medium">
                Question {qIndex + 1}: {question.question}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {question.options.map((option, oIndex) => (
                  <Button
                    key={oIndex}
                    variant={
                      showResults
                        ? oIndex === question.correctAnswer
                          ? 'default'
                          : selectedAnswers[qIndex] === oIndex
                          ? 'destructive'
                          : 'outline'
                        : selectedAnswers[qIndex] === oIndex
                        ? 'default'
                        : 'outline'
                    }
                    className="w-full justify-start"
                    onClick={() => !showResults && handleAnswerSelect(qIndex, oIndex)}
                  >
                    {option}
                  </Button>
                ))}
                {showResults && question.explanation && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {question.explanation}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 flex gap-4">
        <Button
          onClick={checkAnswers}
          disabled={selectedAnswers.includes(-1) || showResults}
        >
          Check Answers
        </Button>
        {showResults && (
          <Button variant="outline" onClick={resetQuiz}>
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
} 