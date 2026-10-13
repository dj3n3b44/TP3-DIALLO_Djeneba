import { fetchCase } from './api/client';
import { NavBar } from './components/NavBar';
import { ErrorState, LoadingState } from './components/StateViews';
import { useAsync } from './hooks/useAsync';
import { useRoute } from './hooks/useRoute';
import { ChronologyPage } from './pages/ChronologyPage';
import { ContradictionsPage } from './pages/ContradictionsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { GraphPage } from './pages/GraphPage';
import { OverviewPage } from './pages/OverviewPage';

export default function App() {
  const route = useRoute();
  const caseState = useAsync(fetchCase, 'case');

  return (
    <div className="app">
      <NavBar route={route} caseName={caseState.data?.name ?? 'TRACE'} />
      <main className="app__main">
        {caseState.error ? (
          <ErrorState message={caseState.error} onRetry={caseState.reload} />
        ) : null}
        {!caseState.error && !caseState.data ? (
          <LoadingState label="Ouverture du dossier…" />
        ) : null}
        {caseState.data ? <CaseView route={route} caseData={caseState.data} /> : null}
      </main>
      <footer className="app__footer">
        TRACE — laboratoire d’enquête numérique · Affaire fictive, données de démonstration
      </footer>
    </div>
  );
}

interface CaseViewProps {
  route: ReturnType<typeof useRoute>;
  caseData: Awaited<ReturnType<typeof fetchCase>>;
}

function CaseView({ route, caseData }: CaseViewProps) {
  switch (route.name) {
    case 'overview':
      return <OverviewPage caseData={caseData} />;
    case 'documents':
    case 'document':
      return <DocumentsPage route={route} caseData={caseData} />;
    case 'chronology':
      return <ChronologyPage caseData={caseData} />;
    case 'graph':
      return <GraphPage focusNode={route.focus} />;
    case 'contradictions':
      return <ContradictionsPage />;
  }
}
