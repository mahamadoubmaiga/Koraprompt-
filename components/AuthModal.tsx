import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, signup } = useAuth();
    const { t } = useTranslations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            login(email);
        } else {
            signup(email);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="card-modern w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-center mb-2">
                        <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                            {isLogin ? t('auth_modal_login_title') : t('auth_modal_signup_title')}
                        </span>
                    </h2>
                    <p className="text-center text-neutral-400 mb-6 text-sm">
                        {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">{t('auth_modal_email_label')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="input-modern w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">{t('auth_modal_password_label')}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="input-modern w-full"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full py-4">
                            {isLogin ? t('login_button') : t('signup_button')}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-brand-light hover:text-brand-primary transition-colors">
                            {isLogin ? t('auth_modal_switch_to_signup') : t('auth_modal_switch_to_login')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
