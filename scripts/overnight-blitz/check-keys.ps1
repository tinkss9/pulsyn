Import-Module "$env:USERPROFILE\.kimi\bin\cred-helper.ps1"
$providers = @('deepseek', 'kimi', 'gemini', 'groq')
foreach ($p in $providers) {
  try {
    $key = Get-AiCredential -Provider $p
    if ($key) {
      Write-Output "$p`:SET ($($key.Length) chars)"
    } else {
      Write-Output "$p`:EMPTY"
    }
  } catch {
    Write-Output "$p`:ERROR - $($_.Exception.Message)"
  }
}
