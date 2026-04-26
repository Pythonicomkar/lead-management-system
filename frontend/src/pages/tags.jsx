import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Hash } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { leadsAPI } from '../api/leads';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({ name: '', color: '#3b82f6' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await leadsAPI.getTags();
      setTags(data || []);
    } catch (error) {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tags/', newTag);
      toast.success('Tag created!');
      setNewTag({ name: '', color: '#3b82f6' });
      fetchTags();
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tags/${id}`);
      toast.success('Tag deleted');
      fetchTags();
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold gradient-text">Tags</h1>
          <p className="text-gray-400 mt-1">Organize leads with custom tags</p>
        </motion.div>

        {/* Create Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Tag</h3>
          <form onSubmit={handleCreate} className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tag Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                placeholder="e.g., VIP, Hot Lead"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTag({ ...newTag, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newTag.color === color ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl"
            >
              <Plus size={18} />
              <span>Create</span>
            </motion.button>
          </form>
        </motion.div>

        {/* Tags Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {loading ? (
            <div className="col-span-full text-center p-8 text-gray-400">Loading...</div>
          ) : tags.length === 0 ? (
            <div className="col-span-full text-center p-8 text-gray-400">
              No tags yet. Create your first tag above.
            </div>
          ) : (
            tags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, translateY: -2 }}
                className="glass p-6 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: tag.color + '20' }}
                  >
                    <Hash size={20} style={{ color: tag.color }} />
                  </div>
                  <div>
                    <p className="font-semibold">{tag.name}</p>
                    <p className="text-sm text-gray-400">{tag.leads_count || 0} leads</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(tag.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="text-red-400" />
                </motion.button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </Layout>
  );
}