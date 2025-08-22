#!/usr/bin/env python3
"""
Test script to verify backend setup and nrgpy installation
"""

import sys
import importlib

def test_imports():
    """Test if all required packages can be imported"""
    required_packages = [
        'flask',
        'flask_cors',
        'werkzeug',
        'nrgpy',
        'requests',
        'dotenv'
    ]
    
    print("Testing package imports...")
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package} - OK")
        except ImportError as e:
            print(f"❌ {package} - FAILED: {e}")
            return False
    
    return True

def test_nrgpy():
    """Test nrgpy specific functionality"""
    print("\nTesting nrgpy functionality...")
    
    try:
        import nrgpy
        print("✅ nrgpy imported successfully")
        
        # Test if convert_rld is available
        if hasattr(nrgpy, 'convert_rld'):
            print("✅ nrgpy.convert_rld is available")
        else:
            print("❌ nrgpy.convert_rld not found")
            print("Available attributes:", [attr for attr in dir(nrgpy) if not attr.startswith('_')])
            return False
            
        print("✅ nrgpy test passed")
        return True
        
    except Exception as e:
        print(f"❌ nrgpy test failed: {e}")
        return False

def test_flask():
    """Test Flask setup"""
    print("\nTesting Flask setup...")
    
    try:
        from flask import Flask
        from flask_cors import CORS
        
        app = Flask(__name__)
        CORS(app)
        
        print("✅ Flask app created successfully")
        print("✅ CORS configured successfully")
        return True
        
    except Exception as e:
        print(f"❌ Flask test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 NRG DataSense Backend Setup Test")
    print("=" * 40)
    
    # Test Python version
    print(f"Python version: {sys.version}")
    
    # Run tests
    tests = [
        ("Package Imports", test_imports),
        ("nrgpy Functionality", test_nrgpy),
        ("Flask Setup", test_flask)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 40)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready to use.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1

if __name__ == '__main__':
    exit(main())
