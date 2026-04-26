import { layout } from '@/designSystem';

function LayoutContainer({ children }) {
  return <div className={`${layout.container} py-8`}>{children}</div>;
}

export default LayoutContainer;
