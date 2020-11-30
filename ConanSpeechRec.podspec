
  Pod::Spec.new do |s|
    s.name = 'ConanSpeechRec'
    s.version = '0.0.1'
    s.summary = 'A native plugin for speech recognition'
    s.license = 'MIT'
    s.homepage = 'https://github.com/capacitor-community/speech-recognition'
    s.author = 'Priyank Patel <priyank.patel@stackspace.ca>'
    s.source = { :git => 'https://github.com/capacitor-community/speech-recognition', :tag => s.version.to_s }
    s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '11.0'
    s.dependency 'Capacitor'
  end