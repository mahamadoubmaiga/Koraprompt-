import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Page, Template } from '../types';
import { TEMPLATES } from '../constants';

interface HomePageProps {
    setPage: (page: Page) => void;
}

const TemplateCard: React.FC<{ template: Template }> = ({ template }) => (
    <div className="bg-neutral-800 rounded-lg flex flex-col h-full border border-neutral-700 hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
        <img src={template.imageUrl} alt={template.name} className="w-full h-40 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <span className="text-xs font-medium bg-brand-primary/20 text-brand-light px-2 py-1 rounded-full">{template.type}</span>
                </div>
                <p className="text-sm text-neutral-400 line-clamp-3">{template.prompt}</p>
            </div>
            <div className="mt-4">
                <span className="text-xs text-neutral-500">{template.generator} / {template.category}</span>
            </div>
        </div>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
    const { t } = useTranslations();

    return (
        <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                {t('hero_title')}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
                {t('hero_subtitle')}
            </p>
            <div className="mt-8 flex justify-center space-x-4">
                <button onClick={() => setPage('generator')} className="bg-brand-primary text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-brand-secondary transition-transform transform hover:scale-105 duration-300">
                    {t('hero_cta_generate')}
                </button>
                <button onClick={() => setPage('explore')} className="bg-neutral-700 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-neutral-600 transition-transform transform hover:scale-105 duration-300">
                    {t('hero_cta_explore')}
                </button>
            </div>

            <div className="mt-24 text-left">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">{t('trending_prompts')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.slice(0, 3).map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </div>
        </div>
    );
};