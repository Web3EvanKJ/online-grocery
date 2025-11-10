import { PageFindWrapper } from '@/components/find/PageFindWrapper';
import { SearchHeader } from '@/components/find/SearchHeader';

export const dynamic = 'force-dynamic';

export default function page() {
  return (
    <>
      <SearchHeader />
      <PageFindWrapper />
    </>
  );
}
