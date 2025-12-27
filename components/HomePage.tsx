import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Page, Template } from '../types';
import { TEMPLATES } from '../constants';

interface HomePageProps {
    setPage: (page: Page) => void;
}

const TemplateCard: React.FC<{ template: Template }> = ({ template }) => (
    <div className="card-modern group overflow-hidden transform transition-all duration-500 hover:scale-105">
        <div className="relative overflow-hidden rounded-t-xl">
            <img src={template.imageUrl} alt={template.name} className="w-full h-40 object-cover transform transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
            <span className="absolute top-3 right-3 text-xs font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-3 py-1 rounded-full shadow-lg">{template.type}</span>
        </div>
        <div className="p-5 flex flex-col flex-grow">
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-brand-light transition-colors">{template.name}</h3>
                <p className="text-sm text-neutral-400 line-clamp-3">{template.prompt}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-700/50 flex justify-between items-center">
                <span className="text-xs text-neutral-500 font-medium">{template.generator}</span>
                <span className="text-xs text-brand-light">{template.category}</span>
            </div>
        </div>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
    const { t } = useTranslations();

    return (
        <div className="container mx-auto px-6 py-20 text-center animate-fade-in">
            <div className="relative">
                <div className="absolute inset-0 flex justify-center items-center opacity-30">
                    <div className="w-96 h-96 bg-brand-primary rounded-full blur-3xl animate-pulse-glow"></div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
                        <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                            {t('hero_title')}
                        </span>
                    </h1>
                    <p className="mt-6 text-xl md:text-2xl text-neutral-300 max-w-3xl mx-auto font-light animate-slide-up" style={{animationDelay: '0.1s'}}>
                        {t('hero_subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <button onClick={() => setPage('generator')} className="btn-primary text-lg px-10 py-4">
                            {t('hero_cta_generate')}
                        </button>
                        <button onClick={() => setPage('explore')} className="btn-secondary text-lg px-10 py-4">
                            {t('hero_cta_explore')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-32 text-left">
                <h2 className="text-4xl font-bold text-center mb-12">
                    <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                        {t('trending_prompts')}
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TEMPLATES.slice(0, 3).map((template, index) => (
                        <div key={template.id} className="animate-slide-up" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                            <TemplateCard template={template} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};