import type { Plugin } from '@opencode-ai/plugin';

const SUBJECT = 'docs/sujet-tp3.pdf';

function baseName(filePath: string): string {
  return (filePath.split(/[\\/]/).pop() ?? '').toLowerCase();
}

function isEnvFile(name: string): boolean {
  return name === '.env' || name.startsWith('.env.');
}

export const TraceGuards: Plugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      const filePath = String(output.args.filePath ?? '');
      const name = baseName(filePath);

      if (input.tool === 'read' && isEnvFile(name) && name !== '.env.example') {
        throw new Error('Lecture des fichiers .env interdite par les règles TRACE (AGENTS.md).');
      }

      if (
        (input.tool === 'edit' || input.tool === 'write') &&
        filePath.replace(/\\/g, '/').toLowerCase().endsWith(SUBJECT)
      ) {
        throw new Error('docs/sujet-tp3.pdf est en lecture seule (AGENTS.md).');
      }
    },
  };
};
