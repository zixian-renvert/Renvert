import EarlyAccess from '@/components/EarlyAccess';

export default function EarlyAccessModule(props: any) {
  return (
    <EarlyAccess
      title={props.title || 'Vær blant de første!'}
      description={props.description || ''}
      buttonText={props.buttonText || 'Få tidlig tilgang'}
      checkboxText={props.checkboxText || 'Jeg har Airbnb/korttidsutleie eiendom'}
      privacyText={
        props.privacyText ||
        'Begrenset antall plasser i beta-programmet. Vi deler aldri din e-post.'
      }
      successTitle={props.successTitle}
      successMessage={props.successMessage}
      _key={props._key}
    />
  );
}
