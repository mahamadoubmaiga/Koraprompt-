import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, signup } = useAuth();
    const { t } = useTranslations();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (isLogin) {
                await login(email);
            } else {
                await signup(email);
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSwitchMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setEmail('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-neutral-800 w-full max-w-md rounded-lg shadow-xl border border-neutral-700" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center mb-4">{isLogin ? t('auth_modal_login_title') : t('auth_modal_signup_title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-3" role="alert">{error}</div>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300">{t('auth_modal_email_label')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full bg-neutral-900 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary"
                                autoComplete="email"
                            />
                        </div>
                        <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-brand-secondary transition-colors">
                            {isLogin ? t('login_button') : t('signup_button')}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <button onClick={handleSwitchMode} className="text-sm text-brand-light hover:underline">
                            {isLogin ? t('auth_modal_switch_to_signup') : t('auth_modal_switch_to_login')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};