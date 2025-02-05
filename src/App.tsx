import axios from 'axios';
import { useState } from 'react';

const PageTest = () => {
    const [srsText, setSrsText] = useState('');
    const [umlImage, setUmlImage] = useState<string | null>(null);
    const [sequenceImages, setSequenceImages] = useState<{ label: string; image: string }[]>([]);
    const [activityImages, setActivityImages] = useState<{ label: string; image: string }[]>([]);
    
    const [usecaseCode, setUsecaseCode] = useState<string | null>(null);
    const [useCases, setUseCases] = useState<string[]>([]);
    const [actors, setActors] = useState<string[]>([]);
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Handle SRS input and move to next step
    const handleSrsSubmit = () => {
        if (srsText.trim()) setStep(2);
    };

    // Generate Use Case Diagram
    const handleUsecaseButtonClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://www.uml-microservice.flint.software/uml/generate-usecase', {
                "srs_text": srsText
            });
            setUmlImage(`data:image/png;base64,${response.data.use_case_diagram}`);
            setUsecaseCode(response.data.usecase_code);
            setUseCases(response.data.use_cases);
            setActors(response.data.actors);
            setStep(3);
        } catch (error) {
            console.error('Error fetching use case diagram:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate Sequence Diagram
    const handleSequenceButtonClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://www.uml-microservice.flint.software/uml/generate-sequence', {
                "usecase_code": usecaseCode,
                "use_cases": useCases,
                "srs_text": srsText
            });
            setSequenceImages(response.data.map((diagram: { label: string, image: string }) => ({
                label: diagram.label,
                image: `data:image/png;base64,${diagram.image}`
            })));
            setStep(4);
        } catch (error) {
            console.error('Error fetching sequence diagram:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate Activity Diagram
    const handleActivityButtonClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://www.uml-microservice.flint.software/uml/generate-activity', {
                "usecase_code": usecaseCode,
                "actors": actors,
                "srs_text": srsText
            });
            setActivityImages(response.data.map((diagram: { label: string, image: string }) => ({
                label: diagram.label,
                image: `data:image/png;base64,${diagram.image}`
            })));
        } catch (error) {
            console.error('Error fetching activity diagram:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">UML Diagram Generator</h1>

            {step === 1 && (
                <div>
                    <textarea 
                        className="w-full p-2 border rounded-md"
                        rows={5}
                        placeholder="Enter SRS Document..."
                        value={srsText}
                        onChange={(e) => setSrsText(e.target.value)}
                    />
                    <button 
                        onClick={handleSrsSubmit} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2"
                    >Next</button>
                </div>
            )}

            {step === 2 && (
                <button 
                    onClick={handleUsecaseButtonClick} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
                    disabled={loading}
                >{loading ? "Generating..." : "Generate Use Case Diagram"}</button>
            )}
            {umlImage && <img src={umlImage} alt="Use Case UML Diagram" className="mt-2 w-1/2" />}

            {step === 3 && (
                <button 
                    onClick={handleSequenceButtonClick} 
                    className="bg-green-600 text-white px-4 py-2 rounded-md mt-4"
                    disabled={loading}
                >{loading ? "Generating..." : "Generate Sequence Diagram"}</button>
            )}
            {sequenceImages.length > 0 && sequenceImages.map((diagram, index) => (
                <div key={index} className="mt-4">
                    <h4 className="text-md font-medium">{diagram.label}</h4>
                    <img src={diagram.image} alt={diagram.label} className="w-1/2 mt-2" />
                </div>
            ))}

            {step === 4 && (
                <button 
                    onClick={handleActivityButtonClick} 
                    className="bg-purple-600 text-white px-4 py-2 rounded-md mt-4"
                    disabled={loading}
                >{loading ? "Generating..." : "Generate Activity Diagram"}</button>
            )}
            {activityImages.length > 0 && activityImages.map((diagram, index) => (
                <div key={index} className="mt-4">
                    <h4 className="text-md font-medium">{diagram.label}</h4>
                    <img src={diagram.image} alt={diagram.label} className="w-1/2 mt-2" />
                </div>
            ))}
        </div>
    );
};

export default PageTest;
