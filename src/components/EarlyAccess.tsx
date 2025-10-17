'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { earlyAccessSubmission } from '@/ui/actions/earlyAccessSubmission';
import { CheckCircle } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface EarlyAccessProps {
  title: string;
  description: string;
  buttonText: string;
  checkboxText: string;
  privacyText: string;
  successTitle?: string;
  successMessage?: string;
  _key?: string;
}

const EarlyAccess: React.FC<EarlyAccessProps> = ({
  title,
  description,
  buttonText,
  checkboxText,
  privacyText,
  successTitle = 'Takk for din interesse!',
  successMessage = 'Du er nå på ventelisten for RenVert. Vi gleder oss til å kontakte deg snart med mer informasjon.',
  _key,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Vennligst skriv inn en valid e-postadresse.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validateName = (name: string) => {
    if (name.trim().length < 2) {
      setNameError('Vennligst skriv inn ditt navn.');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isNameValid = validateName(name);

    if (!isEmailValid || !isNameValid) {
      return;
    }

    // Ensure we have required fields
    if (!email || !name) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await earlyAccessSubmission({
        email,
        name,
        company: isHost ? 'Airbnb/korttidsutleie' : '',
        isHost,
      });

      if (response?.error) {
        setEmailError('Noe gikk galt. Vennligst prøv igjen.');
      } else {
        setSubmitted(true);
        setEmail('');
        setName('');
        setIsHost(false);
      }
    } catch (error) {
      console.error('Early access submission error:', error);
      setEmailError('Noe gikk galt. Vennligst prøv igjen.');
    }

    setIsSubmitting(false);
  };

  const handleCloseSuccess = () => {
    setSubmitted(false);
  };

  return (
    <section id="early-access" className="w-full py-20 md:py-28 bg-white" key={_key}>
      <div className="mx-auto max-w-screen-xl px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="text-xl text-secondary/70 leading-relaxed">{description}</p>

          {!submitted ? (
            <Card className="bg-gradient-to-br from-accent/30 to-slate-100/50 border-0 shadow-xl rounded-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    placeholder="Din e-postadresse"
                    className={`h-14 text-base rounded-xl border-secondary/20 bg-white/80 backdrop-blur-sm ${
                      emailError ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    required
                    disabled={isSubmitting}
                  />
                  {emailError && <p className="text-red-500 text-sm text-left">{emailError}</p>}

                  <Input
                    type="text"
                    placeholder="Ditt navn"
                    className={`h-14 text-base rounded-xl border-secondary/20 bg-white/80 backdrop-blur-sm ${
                      nameError ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) validateName(e.target.value);
                    }}
                    onBlur={() => validateName(name)}
                    required
                    disabled={isSubmitting}
                  />
                  {nameError && <p className="text-red-500 text-sm text-left">{nameError}</p>}

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center h-5">
                      <input
                        id="is-host"
                        type="checkbox"
                        className="h-4 w-4 text-primary border-secondary/20 rounded"
                        checked={isHost}
                        onChange={(e) => setIsHost(e.target.checked)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <label
                      htmlFor="is-host"
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-secondary"
                    >
                      {checkboxText}
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base shadow-lg hover:shadow-xl transition-shadow"
                    disabled={isSubmitting || !!emailError || !!nameError}
                  >
                    {isSubmitting ? 'Sender...' : buttonText}
                  </Button>

                  <p className="text-sm text-secondary/60 leading-relaxed">{privacyText}</p>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-0 shadow-xl rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-4">{successTitle}</h3>
                <p className="text-secondary/70 text-lg mb-6">{successMessage}</p>
                <Button
                  onClick={handleCloseSuccess}
                  variant="outline"
                  className="border-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  Registrer ny e-post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default EarlyAccess;
