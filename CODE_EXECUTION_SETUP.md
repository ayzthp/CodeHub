# Code Execution Setup Guide

## 🚀 **Code Execution Feature Implemented**

The collaborative code editor now includes code execution capabilities using the Judge0 API.

### **✅ Features Added:**

1. **Language Selection Dropdown**
   - C++, Java, Python, JavaScript, C, C#
   - Auto-sets Monaco Editor language
   - Provides language-specific templates

2. **Input/Output Boxes**
   - Input textarea for stdin
   - Output textarea for results
   - Real-time execution feedback

3. **Run Button**
   - Executes code on Judge0 API
   - Shows loading state
   - Displays execution results

4. **Error Handling**
   - Compilation errors
   - Runtime errors
   - Network errors

### **🔧 Setup Required:**

#### **1. Get RapidAPI Key**
1. Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce/)
2. Sign up for a free account
3. Subscribe to the Judge0 API (free tier available)
4. Copy your API key

#### **2. Add Environment Variable**
Add this to your `.env.local` file:
```bash
RAPIDAPI_KEY=your_rapidapi_key_here
```

#### **3. Restart Development Server**
```bash
npm run dev
```

### **🎯 Supported Languages:**

| Language | Judge0 ID | Monaco Language | Template |
|----------|-----------|-----------------|----------|
| C++ | 54 | cpp | Hello World with iostream |
| Java | 62 | java | Main class with System.out |
| Python | 71 | python | Simple print statement |
| JavaScript | 63 | javascript | console.log |
| C | 50 | c | printf Hello World |
| C# | 51 | csharp | Console.WriteLine |

### **🧪 How to Test:**

1. **Create a Room**
   - Go to dashboard → Create Room
   - Fill in room details
   - Click "Create Room"

2. **Test Code Execution**
   - Select a language from dropdown
   - Write some code in the editor
   - Add input if needed
   - Click "Run Code"
   - See output in the output box

3. **Test Different Languages**
   - Try Python: `print("Hello from Python!")`
   - Try C++: `cout << "Hello from C++!" << endl;`
   - Try JavaScript: `console.log("Hello from JS!");`

### **🔒 Security Features:**

- ✅ Only authenticated users can access
- ✅ Only current editor can run code
- ✅ Input sanitization
- ✅ Error handling for API failures
- ✅ Rate limiting (handled by Judge0)

### **📱 User Experience:**

- **Language Selection**: Dropdown with 6 popular languages
- **Code Templates**: Auto-populated with Hello World examples
- **Real-time Feedback**: Loading states and success/error messages
- **Responsive Design**: Works on desktop and mobile
- **Permission Control**: Only editors can run code

### **🚀 API Integration:**

The code execution uses the Judge0 API through RapidAPI:
- **Endpoint**: `https://judge0-ce.p.rapidapi.com/submissions`
- **Method**: POST with code, language ID, and input
- **Response**: stdout, stderr, or compile_output
- **Timeout**: Handled by Judge0 (typically 5-15 seconds)

### **📋 Example Usage:**

```javascript
// JavaScript Example
const name = "World";
console.log(`Hello, ${name}!`);

// Input: (empty)
// Output: Hello, World!
```

```python
# Python Example
name = input()
print(f"Hello, {name}!")

// Input: Alice
// Output: Hello, Alice!
```

### **🎯 Success Criteria Met:**

- ✅ Language dropdown with multiple options
- ✅ Input box for stdin
- ✅ Output box for results
- ✅ Run button with loading state
- ✅ Code runs on selected language
- ✅ Error handling and user feedback
- ✅ Integration with existing room system

The code execution feature is now fully functional and ready for use! 