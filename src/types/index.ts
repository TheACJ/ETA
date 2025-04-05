interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}
interface Question {
  id: string;
  text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  choices?: Choice[];
}