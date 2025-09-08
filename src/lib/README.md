# Mock Payment System

This directory contains a **mock payment system** that simulates blockchain integrations for the MLStudio Data Marketplace. This is designed for hackathon demos and development purposes.

## 🎯 **Purpose**

Instead of connecting to real blockchain services, we've created a comprehensive mock system that:
- Simulates KALE token transactions and balances
- Provides realistic price feeds (simulating Reflector oracles)
- Manages dataset marketplace operations
- Handles data contributions and validation
- Tracks rewards and staking

## 📁 **Files**

### `mockPaymentSystem.ts`
The core mock system that provides:
- **MockKaleBalance**: Token balance simulation
- **MockPriceFeed**: Price data simulation (KALE, USDC, XLM)
- **MockTransaction**: Transaction history simulation
- **MockDataset**: Dataset marketplace simulation
- **MockContribution**: Data contribution simulation
- **MockValidationRequest**: Validation workflow simulation

### Components
- **MockKaleIntegration.tsx**: KALE token wallet and staking interface
- **MockDataMarketplace.tsx**: Dataset browsing and purchasing
- **MockContributionCenter.tsx**: Data contribution management

## 🔧 **Features**

### KALE Token Integration
- ✅ Wallet balance management
- ✅ Staking and unstaking simulation
- ✅ Transaction history
- ✅ Real-time price updates (simulated)
- ✅ Reward tracking

### Data Marketplace
- ✅ Dataset browsing and filtering
- ✅ Purchase simulation with KALE tokens
- ✅ Category-based organization
- ✅ Rating and review system
- ✅ File size and format display

### Contribution System
- ✅ Upload new datasets
- ✅ Contribution status tracking
- ✅ Reward calculation
- ✅ Validation workflow
- ✅ Performance statistics

### Price Feeds (Reflector Simulation)
- ✅ KALE token pricing
- ✅ USDC and XLM price feeds
- ✅ Real-time price updates
- ✅ Market statistics
- ✅ Confidence scores

## 🚀 **Usage**

The mock system is automatically initialized when components are loaded. All data is stored in memory and resets on page refresh.

### Example Usage:
```typescript
import { mockPaymentSystem } from '@/lib/mockPaymentSystem';

// Get current KALE balance
const balance = mockPaymentSystem.getKaleBalance();

// Get price feeds
const prices = mockPaymentSystem.getPriceFeeds();

// Purchase a dataset
const result = await mockPaymentSystem.purchaseDataset('dataset-id', 100);

// Submit a contribution
const contribution = await mockPaymentSystem.submitContribution({
  name: 'My Dataset',
  description: 'A great dataset',
  category: 'Computer Vision',
  tags: ['images', 'classification'],
  status: 'pending',
  fileSize: 1024 * 1024 * 10, // 10MB
  format: 'zip'
});
```

## 🎨 **UI Components**

### MockKaleIntegration
- Wallet overview with balance cards
- Staking interface with APY display
- Transaction history
- Statistics and performance charts

### MockDataMarketplace
- Grid and list view modes
- Advanced filtering and search
- Category-based browsing
- Purchase flow with KALE tokens

### MockContributionCenter
- Upload interface with progress
- Contribution management
- Status tracking
- Reward history

## 🔄 **Data Flow**

1. **User uploads data** → MockContributionCenter
2. **Data gets validated** → ValidationDashboard (simulated)
3. **Rewards are distributed** → MockKaleIntegration
4. **Data becomes available** → MockDataMarketplace
5. **Users purchase data** → KALE token transactions

## 🎭 **Simulation Details**

### Price Updates
- Prices update every 10 seconds
- Random fluctuations within realistic ranges
- KALE price: ~$0.25 with 5% daily volatility

### Transaction Simulation
- Instant confirmation for most transactions
- Realistic transaction hashes (0x...)
- Proper status tracking (pending, completed, failed)

### Reward System
- Data contributions: 50-200 KALE tokens
- Staking rewards: 12.5% APY
- Validation rewards: 25-100 KALE tokens

## 🚧 **Limitations**

- All data is stored in memory (resets on refresh)
- No real blockchain connectivity
- Simulated network delays
- Mock transaction hashes
- No real file uploads

## 🔮 **Future Enhancements**

To make this production-ready, you would:
1. Replace mock data with real blockchain APIs
2. Implement actual file storage
3. Add real authentication and user management
4. Connect to KALE and Reflector networks
5. Implement proper error handling and retry logic

## 🎯 **Hackathon Demo**

This mock system is perfect for hackathon demonstrations because it:
- Shows the complete user experience
- Demonstrates all key features
- Works without external dependencies
- Provides realistic data and interactions
- Can be easily customized and extended

The system simulates a real data marketplace with blockchain integration, making it an excellent proof-of-concept for the composability theme!
