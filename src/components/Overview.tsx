"use client";

import { BarChart3, Database, Network, Upload, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Overview() {
  // Real-time data from Convex
  const datasets = useQuery(api.datasets.getMyDatasets);
  // Temporarily commented out while Convex is deploying
  // const pipelines = useQuery(api.transformationPipelines.getMyPipelines);
  // const trainingJobs = useQuery(api.trainingJobs.getMyTrainingJobs);
  // const recentJobs = useQuery(api.trainingJobs.getRecentCompletedJobs, { limit: 5 });

  // Calculate real-time statistics
  const datasetCount = datasets?.length || 0;
  const pipelineCount = 0; // Temporarily set to 0 while Convex is deploying
  const trainingJobCount = 0; // Temporarily set to 0 while Convex is deploying
  const completedJobsCount = 0; // Temporarily set to 0 while Convex is deploying

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-ml-dark-400">Welcome to MLStudio - your professional machine learning platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Database size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{datasetCount}</p>
              <p className="text-sm text-ml-dark-400">Datasets</p>
            </div>
          </div>
        </div>

        <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Network size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pipelineCount}</p>
              <p className="text-sm text-ml-dark-400">Pipelines</p>
            </div>
          </div>
        </div>

        <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <BarChart3 size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{trainingJobCount}</p>
              <p className="text-sm text-ml-dark-400">Training Jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Upload size={24} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedJobsCount}</p>
              <p className="text-sm text-ml-dark-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        {/* recentJobs && recentJobs.length > 0 ? ( */}
          <div className="space-y-4">
            {/* {recentJobs.map((job) => ( */}
              <div key="placeholder" className="flex items-center gap-4 p-3 bg-ml-dark-200 rounded-md">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white">Training completed: Placeholder</p>
                  <p className="text-sm text-ml-dark-400">
                    Accuracy: 0.0%
                  </p>
                  <p className="text-xs text-ml-dark-400">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            {/* ))} */}
          </div>
        {/* ) : ( */}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-ml-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={24} className="text-ml-dark-400" />
            </div>
            <p className="text-ml-dark-400">No recent activity</p>
            <p className="text-sm text-ml-dark-400 mt-2">Start building your ML projects to see activity here</p>
          </div>
        {/* )} */}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-ml-dark-200 hover:bg-ml-dark-300 rounded-md text-left transition-colors">
              <Database size={20} className="text-blue-400" />
              <span className="text-white">Upload New Dataset</span>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 bg-ml-dark-200 hover:bg-ml-dark-300 rounded-md text-left transition-colors">
              <Network size={20} className="text-green-400" />
              <span className="text-white">Create New Model</span>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 bg-ml-dark-200 hover:bg-ml-dark-300 rounded-md text-left transition-colors">
              <BarChart3 size={20} className="text-purple-400" />
              <span className="text-white">Start Training</span>
            </button>
          </div>
        </div>

        <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          {/* completedJobsCount > 0 ? ( */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ml-dark-400">Success Rate</span>
                  <span className="text-white font-medium">
                    0.0%
                  </span>
                </div>
                <div className="w-full bg-ml-dark-300 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `0%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ml-dark-400">Active Jobs</span>
                  <span className="text-white font-medium">
                    0
                  </span>
                </div>
                <div className="w-full bg-ml-dark-300 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ 
                      width: `0%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          {/* ) : ( */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-ml-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={24} className="text-ml-dark-400" />
              </div>
              <p className="text-ml-dark-400">No performance data</p>
              <p className="text-sm text-ml-dark-400 mt-2">Train your first model to see performance metrics</p>
            </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
