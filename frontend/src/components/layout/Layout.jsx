import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen animated-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}