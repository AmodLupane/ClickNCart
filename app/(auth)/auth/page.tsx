"use client";
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation";
import { getSignupFormData, handleSignupSubmit } from "@/actions/auth/signup";
import { getLoginFormData, handleLoginSubmit } from "@/actions/auth/login";
import { toast } from "sonner"
import { IAttributes } from "oneentry/dist/base/utils";

interface SignUpFormData {
    email: string;
    password: string;
    name: string;
}

interface LoginFormData {
    email: string;
    password: string;
}


export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState<IAttributes[]>([]);

    const [inputValues, setInputValues] = useState<Partial<SignUpFormData & LoginFormData>>({});

    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState<string | null>('Not valid');

    useEffect(() => {
        const type = searchParams.get('type');

        setIsSignUp(type !== 'login');
    }, [searchParams]);

    useEffect(() => {
        setIsLoading(true);

        setError(null);

        const fetchData = isSignUp ? getSignupFormData : getLoginFormData;

        fetchData()
            .then((data) => setFormData(data))

            .catch((err) => setError('Failed to load form data. Please try again'))

            .finally(() => setIsLoading(false));
    }, [isSignUp]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setInputValues((prevValues) => ({ ...prevValues, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        setError(null);

        try {
            if (isSignUp) {
                if (inputValues.email && inputValues.password && inputValues.name) {
                    const response = await handleSignupSubmit(
                        inputValues as SignUpFormData
                    );

                    if ('identifier' in response) {
                        setInputValues({});

                        setIsSignUp(false);

                        toast("User has been created", {
                            description: 'Please enter your credentials to log in.',
                            duration: 5000
                        });
                    } else {
                        setError(response.message);
                    }
                } else {
                    setError('Please fill out all required fields.');
                }
            } else {
                if (inputValues.email && inputValues.password) {
                    const response = await handleLoginSubmit(
                        inputValues as LoginFormData
                    );

                    if (response.message) {
                        setError(response.message);
                    }
                } else {
                    setError('Please fill out all required fields.');
                }
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'An error occurred. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleForm = () => {
        setIsSignUp(!isSignUp);
        setError(null);
        setInputValues({});
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row min-h-[600px]">

                        {/* Left Side - Image */}
                        <div className="lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10 text-center lg:text-left">
                                <img
                                    src="/login.svg"
                                    alt="Login illustration"
                                    className="w-full max-w-md mx-auto lg:mx-0 h-auto drop-shadow-2xl"
                                />
                                <div className="mt-8 text-white">
                                    <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                                        Welcome to ClickNCart
                                    </h3>
                                    <p className="text-lg lg:text-xl opacity-90">
                                        Your premium shopping destination awaits
                                    </p>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                            <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                            <div className="w-full max-w-md mx-auto">

                                {/* Back Button */}
                                {/* <div className="mb-8 cursor-pointer inline-flex" onClick={() => router.push('/')}>
                                <ChevronLeft className="text-gray-400 hover:text-gray-600 h-8 w-8 border-2 border-gray-200 hover:border-gray-300 rounded-full p-1 transition-all duration-200 hover:shadow-md" />
                            </div> */}

                                {/* Form Header */}
                                <div className="mb-8">
                                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text pb-2 text-transparent">
                                        {isSignUp ? 'Sign Up' : 'Sign In'}
                                    </h2>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {isSignUp ? 'Join ClickNCart today and discover exclusive deals on your favorite products!' : 'Welcome back to ClickNCart! Log in to continue your shopping journey.'}
                                    </p>
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg shadow-sm">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium">{error}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Form and Loading */}
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="text-center">
                                            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                                            <p className="text-gray-500">Loading form...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        {formData.map((field: any) => (
                                            <div key={field.marker} className="space-y-2">
                                                <Label htmlFor={field.marker} className="text-sm font-semibold text-gray-700 block">
                                                    {field.localizeInfos.title}
                                                </Label>

                                                <Input
                                                    id={field.marker}
                                                    type={field.marker === 'password' ? 'password' : 'text'}
                                                    name={field.marker}
                                                    className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                                                    placeholder={`Enter your ${field.localizeInfos.title.toLowerCase()}`}
                                                    value={
                                                        inputValues[field.marker as keyof typeof inputValues] || ''
                                                    }
                                                    onChange={handleInputChange}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        ))}

                                        {error && (
                                            <div className='text-red-500 mt-2 text-center'>{error}</div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || formData.length === 0}
                                            className="w-full py-4 mt-8 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-3 h-5 cursor-pointer w-5 animate-spin" />
                                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                                </>
                                            ) : (
                                                isSignUp ? 'Sign Up' : 'Sign In'
                                            )}
                                        </Button>

                                    </form>
                                )}

                                {/* Toggle Form */}
                                <div className="mt-8 text-center">
                                    <p className="text-gray-600 inline">
                                        {isSignUp ? 'Already a member?' : "Don't have an account?"}
                                    </p>

                                    <Button variant='link'
                                        className="text-purple-600 hover:text-purple-700 font-semibold text-base ml-1 p-0 h-auto underline-offset-4 hover:underline cursor-pointer"
                                        onClick={toggleForm}>
                                        {isSignUp ? 'Sign in' : 'Sign up'}
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}