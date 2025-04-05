import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';

import { api } from '../lib/api'; // Adjust path as needed
import { Database } from '../lib/database.types';
import { Button } from './ui/Button'; // Assumed UI component
import { Card } from './ui/Card'; // Assumed UI component
import { Input } from './ui/Input'; // Assumed UI component
import { Select } from './ui/Select'; // Assumed UI component
import { Stepper } from './ui/Stepper'; // New or assumed UI component
import { Spinner } from './ui/Spinner'; // New or assumed UI component
import { ExamEditor } from './ExamEditor'; // Existing component
import { QuestionEditor } from './QuestionEdit'; // Existing component

// --- Type Definitions ---
type Subject = Database['public']['Tables']['subjects']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type ExamInsert = Database['public']['Tables']['exams']['Insert'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type ChoiceInsert = Database['public']['Tables']['choices']['Insert'];


interface ExamFormData {
    title: string;
    description: string;
    subject_id: string;
    class_id: string;
    duration: number;
    // total_points: number; // Removed - will be calculated
    start_date: string;
    end_date: string;
    instructions: string;
    content: string; // Content from ExamEditor
    questions: Question[];
}

type ValidationErrors = Record<string, string>; // Field name -> Error message

const LOCAL_STORAGE_KEY = 'examCreateDraft';

// --- Initial State ---
const initialExamData: ExamFormData = {
    title: '',
    description: '',
    subject_id: '',
    class_id: '',
    duration: 60,
    start_date: '',
    end_date: '',
    instructions: '',
    content: '',
    questions: [],
};

// --- Main Component ---
export default function ExamCreate() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [examData, setExamData] = useState<ExamFormData>(initialExamData);
    const [isLoading, setIsLoading] = useState(false); // General loading (initial fetch)
    const [isSubmitting, setIsSubmitting] = useState(false); // Submission loading
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isDirty, setIsDirty] = useState(false); // Track if form has changes

    // --- Calculated Total Points ---
    const totalPoints = useMemo(() => {
        return examData.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    }, [examData.questions]);

    // --- Autosave Logic ---
    const saveDraft = useCallback(
        debounce((data: ExamFormData) => {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
                console.log('Draft saved to localStorage');
            } catch (error) {
                console.error('Error saving draft to localStorage:', error);
                toast.error('Could not save draft.');
            }
        }, 1000), // Debounce saving by 1 second
        []
    );

    useEffect(() => {
        if (isDirty) {
            saveDraft(examData);
        }
    }, [examData, isDirty, saveDraft]);

    // --- Load Draft on Mount ---
    useEffect(() => {
        try {
            const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedDraft) {
                if (window.confirm('An unsaved draft was found. Do you want to restore it?')) {
                    const parsedData = JSON.parse(savedDraft);
                    // Basic validation if structure changed
                    if (parsedData && typeof parsedData === 'object') {
                        setExamData(parsedData);
                        toast.info('Draft restored.');
                        setIsDirty(true); // Mark as dirty since it's loaded data
                    } else {
                        localStorage.removeItem(LOCAL_STORAGE_KEY); // Remove invalid draft
                    }
                } else {
                    // User chose not to restore, remove the draft
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error('Error loading draft from localStorage:', error);
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean up potentially corrupted data
        }
        // Fetch initial data regardless of draft status
        fetchInitialData();
    }, []); // Run only once on mount

    // --- Prevent navigation with unsaved changes ---
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                // Standard browser confirmation message
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);


    // --- Fetch Subjects and Classes ---
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [subjectsRes, classesRes] = await Promise.all([
                api.subjects.getAll(),
                api.classes.getAll(),
            ]);

            if (subjectsRes.error) throw new Error(`Subjects: ${subjectsRes.error.message}`);
            setSubjects(subjectsRes.data || []);

            if (classesRes.error) throw new Error(`Classes: ${classesRes.error.message}`);
            setClasses(classesRes.data || []);

        } catch (err: any) {
            toast.error(`Failed to load initial data: ${err.message}`);
            console.error("Initial data fetch error:", err);
            // Optional: Navigate back or show critical error state
        } finally {
            setIsLoading(false);
        }
    };

    // --- Validation ---
    const validateStep = (currentStep: number): boolean => {
        const errors: ValidationErrors = {};
        if (currentStep === 1) {
            if (!examData.title.trim()) errors['title'] = 'Title is required';
            if (!examData.subject_id) errors['subject_id'] = 'Subject is required';
            if (!examData.class_id) errors['class_id'] = 'Class is required';
            if (examData.duration <= 0) errors['duration'] = 'Duration must be positive';
             if (!examData.start_date) errors['start_date'] = 'Start date is required'; // Example: Make dates required
             if (!examData.end_date) errors['end_date'] = 'End date is required';
             if (examData.start_date && examData.end_date && new Date(examData.end_date) <= new Date(examData.start_date)) {
                 errors['end_date'] = 'End date must be after start date';
             }
        }
        // No specific validation needed for Step 2 (content editor) unless required

        if (currentStep === 3) {
            if (examData.questions.length === 0) {
                errors['questions'] = 'At least one question is required';
            }
            examData.questions.forEach((q, index) => {
                const qPrefix = `question_${q.id}`; // Unique prefix for each question's errors
                if (!q.text.trim()) errors[`${qPrefix}_text`] = `Q${index + 1}: Text is required`;
                if (q.points <= 0) errors[`${qPrefix}_points`] = `Q${index + 1}: Points must be positive`;
                if (q.question_type === 'multiple_choice') {
                    if (!q.choices || q.choices.length < 2) {
                        errors[`${qPrefix}_choices`] = `Q${index + 1}: At least two choices are required`;
                    } else if (!q.choices.some(c => c.isCorrect)) {
                        errors[`${qPrefix}_correct`] = `Q${index + 1}: At least one choice must be correct`;
                    }
                    // Validate choice text
                     q.choices?.forEach((c, cIndex) => {
                         if(!c.text.trim()) errors[`${qPrefix}_choice_${c.id}_text`] = `Q${index+1}, Choice ${cIndex+1}: Text cannot be empty`;
                     })
                }
            });
             if(totalPoints <= 0 && examData.questions.length > 0) { // Check if points sum is zero
                 errors['total_points_calc'] = 'Total points for the exam must be greater than zero based on question points.';
             }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value) || 0 : value;
        setExamData(prev => ({ ...prev, [name]: val }));
        setIsDirty(true);
         // Clear validation error for this field on change
         if (validationErrors[name]) {
             setValidationErrors(prev => {
                 const newErrors = { ...prev };
                 delete newErrors[name];
                 return newErrors;
             });
         }
    };

    const handleExamContentChange = useCallback((content: string) => {
        setExamData(prev => ({ ...prev, content }));
        setIsDirty(true);
    }, []);

    const handleQuestionsChange = useCallback((questions: Question[]) => {
        setExamData(prev => ({ ...prev, questions }));
        setIsDirty(true);
         // Potentially clear question-related errors here if structure changes significantly
         // Or rely on re-validation before submit/next step
    }, []);

    const handleDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;
        const reorderedQuestions = Array.from(examData.questions);
        const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
        reorderedQuestions.splice(result.destination.index, 0, movedQuestion);
        handleQuestionsChange(reorderedQuestions); // Use existing handler to update state and mark dirty
    }, [examData.questions, handleQuestionsChange]);

    const handleNextStep = () => {
        if (validateStep(step)) {
            if (step < 3) {
                setStep(step + 1);
                 window.scrollTo(0, 0); // Scroll to top on step change
            }
        } else {
            toast.warn('Please fix the errors before proceeding.');
             window.scrollTo(0, 0); // Scroll to top to show errors
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
            window.scrollTo(0, 0); // Scroll to top
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) { // Validate all steps before final submit
             toast.error('Please review all steps and fix the errors.');
             // Optionally direct user to the first step with errors
             if(!validateStep(1)) setStep(1);
             else if (!validateStep(3)) setStep(3); // Assuming step 2 has no validation
             window.scrollTo(0, 0); // Scroll to top
             return;
         }

        setIsSubmitting(true);
        toast.info('Creating exam...', { autoClose: false, toastId: 'exam-submit' });

        try {
            const currentUser = (await api.auth.getCurrentUser()).data.user;
            if (!currentUser) throw new Error("User not authenticated.");

            const examInsert: ExamInsert = {
                title: examData.title,
                description: examData.description || null,
                subject_id: examData.subject_id,
                class_id: examData.class_id,
                duration: examData.duration,
                total_points: totalPoints, // Use calculated points
                start_date: new Date(examData.start_date).toISOString(), // Ensure ISO format
                end_date: new Date(examData.end_date).toISOString(),
                instructions: examData.instructions || null,
                // content: examData.content, // Store rich text content if schema allows
                created_by: currentUser.id,
            };

            // --- Create Exam Record ---
            const { data: exam, error: examError } = await api.exams.create(examInsert);
            if (examError || !exam) throw new Error(`Failed to create exam record: ${examError?.message || 'Unknown error'}`);
            toast.update('exam-submit', { render: 'Exam record created, adding questions...', type: 'info' });


            // --- Create Questions and Choices (Sequential for now) ---
            // Consider backend function for atomicity if possible
            for (const [index, q] of examData.questions.entries()) {
                toast.update('exam-submit', { render: `Adding Question ${index + 1}...`, type: 'info' });
                const questionInsert: QuestionInsert = {
                    exam_id: exam.id,
                    text: q.text,
                    question_type: q.question_type,
                    points: q.points,
                    subject_id: examData.subject_id, // Link question to subject too
                };
                const { data: question, error: questionError } = await api.questions.create(questionInsert);
                if (questionError || !question) {
                    // Attempt to clean up? Difficult without transactions.
                    throw new Error(`Failed to create Question ${index + 1}: ${questionError?.message || 'Unknown error'}`);
                }

                if (q.question_type === 'multiple_choice' && q.choices) {
                    for (const [cIndex, c] of q.choices.entries()) {
                         toast.update('exam-submit', { render: `Adding Question ${index + 1}, Choice ${cIndex + 1}...`, type: 'info' });
                        const choiceInsert: ChoiceInsert = {
                            question_id: question.id,
                            text: c.text,
                            is_correct: c.isCorrect,
                        };
                        const { error: choiceError } = await api.choices.create(choiceInsert);
                        if (choiceError) {
                            throw new Error(`Failed to create Choice ${cIndex + 1} for Question ${index + 1}: ${choiceError.message}`);
                        }
                    }
                }
            }

            // --- Success ---
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear draft on success
            setIsDirty(false); // Mark as not dirty anymore
            toast.update('exam-submit', { render: 'Exam created successfully!', type: 'success', autoClose: 5000 });
            navigate('/exams'); // Or navigate to the newly created exam's page

        } catch (err: any) {
            console.error("Exam creation failed:", err);
            toast.update('exam-submit', { render: `Exam creation failed: ${err.message}`, type: 'error', autoClose: 10000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <Card className="p-6 animate-fade-in">
                        <h2 className="text-xl font-semibold mb-6">Exam Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Input
                                 label="Title *"
                                 id="title"
                                 name="title"
                                 value={examData.title}
                                 onChange={handleInputChange}
                                 required
                                 error={validationErrors['title']}
                                 maxLength={255} // Example: Add length limit
                             />
                            <Select
                                label="Subject *"
                                id="subject_id"
                                name="subject_id"
                                value={examData.subject_id}
                                onChange={handleInputChange}
                                options={[{ value: '', label: 'Select a subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
                                required
                                error={validationErrors['subject_id']}
                                disabled={isLoading}
                            />
                            <Select
                                label="Class *"
                                id="class_id"
                                name="class_id"
                                value={examData.class_id}
                                onChange={handleInputChange}
                                options={[{ value: '', label: 'Select a class' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                                required
                                error={validationErrors['class_id']}
                                disabled={isLoading}
                            />
                             <Input
                                 label="Duration (minutes) *"
                                 id="duration"
                                 name="duration"
                                 type="number"
                                 value={examData.duration}
                                 onChange={handleInputChange}
                                 min={1}
                                 required
                                 error={validationErrors['duration']}
                             />
                            <Input
                                label="Start Date *"
                                id="start_date"
                                name="start_date"
                                type="datetime-local"
                                value={examData.start_date}
                                onChange={handleInputChange}
                                 required
                                 error={validationErrors['start_date']}
                             />
                            <Input
                                label="End Date *"
                                id="end_date"
                                name="end_date"
                                type="datetime-local"
                                value={examData.end_date}
                                onChange={handleInputChange}
                                required
                                error={validationErrors['end_date']}
                            />
                            {/* Description and Instructions could be Textarea components if available */}
                             <Input
                                 label="Description"
                                 id="description"
                                 name="description"
                                 value={examData.description}
                                 onChange={handleInputChange}
                                 className="md:col-span-2" // Span across two columns
                                // Make it a textarea if your Input component supports it or use <textarea>
                             />
                            <Input
                                label="Instructions"
                                id="instructions"
                                name="instructions"
                                value={examData.instructions}
                                onChange={handleInputChange}
                                className="md:col-span-2"
                                // Make it a textarea if your Input component supports it or use <textarea>
                            />
                        </div>
                         {/* Display calculated points */}
                         <div className="mt-6 p-4 bg-gray-100 rounded">
                             <p className="font-semibold">Calculated Total Points: {totalPoints}</p>
                             {validationErrors['total_points_calc'] && <p className="text-red-600 text-sm mt-1">{validationErrors['total_points_calc']}</p>}
                         </div>
                    </Card>
                );
            case 2:
                return (
                    <Card className="p-6 animate-fade-in">
                        <h2 className="text-xl font-semibold mb-6">Exam Content (Optional)</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Use this section to add general instructions, reading passages, or other content relevant to the entire exam.
                        </p>
                        <ExamEditor
                            initialValue={examData.content}
                            onChange={handleExamContentChange}
                        />
                         {/* No specific validation needed here usually */}
                    </Card>
                );
            case 3:
                return (
                    <Card className="p-6 animate-fade-in">
                        <h2 className="text-xl font-semibold mb-6">Questions</h2>
                         {validationErrors['questions'] && <p className="text-red-600 text-sm mb-4">{validationErrors['questions']}</p>}
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="questions">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        <QuestionEditor
                                            questions={examData.questions}
                                            onQuestionsChange={handleQuestionsChange}
                                            validationErrors={validationErrors} // Pass errors down
                                        />
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </Card>
                );
            default:
                return null;
        }
    };

    // --- Main Render ---
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
             {/* <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" /> */}

            <h1 className="text-3xl font-bold mb-6 text-center">Create New Exam</h1>

            {/* Stepper UI */}
            <Stepper currentStep={step} steps={['Details', 'Content', 'Questions']} className="mb-8" />

            {/* Loading State for Initial Data */}
            {isLoading && (
                 <div className="flex justify-center items-center h-40">
                    <Spinner size="lg" />
                    <p className="ml-4 text-gray-600">Loading initial data...</p>
                 </div>
            )}

            {/* Render Content based on step */}
             {!isLoading && (
                 <div className="step-content mb-8">
                     {renderStepContent()}
                 </div>
             )}


            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
                <Button
                    onClick={handlePrevStep}
                    disabled={step === 1 || isSubmitting}
                    variant="secondary" // Example style
                >
                    Previous
                </Button>

                 {/* Final Submit Button on last step */}
                 {step === 3 && (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoading}
                         className="relative" // For positioning spinner
                    >
                         {isSubmitting ? (
                             <>
                                 <Spinner size="sm" className="absolute left-4 top-1/2 -translate-y-1/2" />
                                 <span className="ml-6">Creating Exam...</span>
                             </>
                         ) : (
                            'Create Exam'
                         )}
                     </Button>
                 )}

                {/* Next Button */}
                {step < 3 && (
                    <Button
                        onClick={handleNextStep}
                        disabled={isSubmitting || isLoading}
                    >
                        Next
                    </Button>
                )}
            </div>

             {/* Draft status indicator (optional) */}
             {isDirty && <p className="text-sm text-gray-500 mt-4 text-center">You have unsaved changes.</p>}
        </div>
    );
}